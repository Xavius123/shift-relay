import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { localDateKey } from './logTemplates';

import { demoActor } from '@/features/auth/demoAccounts';
import type { DevState } from '@/features/dev/devSlice';
import { issueDraftError } from '@/features/issues/issueCategories';
import { canManageIssues } from '@/features/issues/issuePermissions';
import type { Issue, RaiseIssueInput, ResolveIssueInput } from '@/features/issues/types';

import {
  canDeleteWalkPhotos,
  canToggleChecks,
  requiredSignerAccountId,
  requiredSignerMessage,
  sequenceBlockMessage,
} from './logPermissions';
import { createSeedData } from './seedLogs';
import type {
  AddWalkPhotosInput,
  RemoveWalkPhotoInput,
  ShiftLog,
  SignOffLogInput,
  ToggleCheckInput,
} from './types';

type MockQuery =
  | { operation: 'listLogs' }
  | { operation: 'detailLog'; id: string }
  | { operation: 'listIssues' }
  | { operation: 'toggleCheck'; input: ToggleCheckInput }
  | { operation: 'addWalkPhotos'; input: AddWalkPhotosInput }
  | { operation: 'removeWalkPhoto'; input: RemoveWalkPhotoInput }
  | { operation: 'signOffLog'; input: SignOffLogInput }
  | { operation: 'raiseIssue'; input: RaiseIssueInput }
  | { operation: 'resolveIssue'; input: ResolveIssueInput };

export interface LogsApiError {
  status: 404 | 409 | 503;
  data: { message: string };
}

export function isLogsApiError(error: unknown): error is LogsApiError {
  if (typeof error !== 'object' || error === null || !('status' in error)) return false;
  return error.status === 404 || error.status === 409 || error.status === 503;
}

interface StateWithDev {
  dev: DevState;
}

const seed = createSeedData();
const logs = seed.logs;
const issues = seed.issues;

function cloneLog(log: ShiftLog): ShiftLog {
  return {
    ...log,
    confirmations: log.confirmations.map((item) => ({ ...item })),
    signOffs: log.signOffs.map((item) => ({ ...item })),
    checkEvents: log.checkEvents.map((item) => ({ ...item })),
    issueReview: log.issueReview
      ? { ...log.issueReview, issueIds: [...log.issueReview.issueIds] }
      : null,
    walkPhotos: log.walkPhotos.map((item) => ({ ...item })),
  };
}

let walkPhotoCount = 0;

function cloneIssue(issue: Issue): Issue {
  return {
    ...issue,
    photos: issue.photos.map((photo) => ({ ...photo })),
    events: issue.events.map((item) => ({ ...item })),
  };
}

function error(status: LogsApiError['status'], message: string) {
  return { error: { status, data: { message } } };
}

const mockBaseQuery: BaseQueryFn<MockQuery, unknown, LogsApiError> = async (query, api) => {
  const { latencyMs, simulateFailure } = (api.getState() as StateWithDev).dev;
  if (latencyMs > 0) await new Promise<void>((resolve) => setTimeout(resolve, latencyMs));
  if (simulateFailure) return error(503, 'The shift log service is unavailable.');

  if (query.operation === 'listLogs') return { data: logs.map(cloneLog) };
  if (query.operation === 'listIssues') return { data: issues.map(cloneIssue) };

  if (query.operation === 'detailLog') {
    const log = logs.find((item) => item.id === query.id);
    return log ? { data: cloneLog(log) } : error(404, "This shift log doesn't exist.");
  }

  if (query.operation === 'toggleCheck') {
    const { input } = query;
    const log = logs.find((item) => item.id === input.id);
    if (!log) return error(404, "This shift log doesn't exist.");
    const check = log.confirmations.find((item) => item.id === input.checkId);
    if (!check) return error(404, "This check doesn't exist.");
    const dayLogs = logs.filter((item) => item.operationalDate === log.operationalDate);
    if (!canToggleChecks(input.accountId, log, dayLogs)) {
      return error(409, "Only today's open log can be changed, by the Shift Manager on duty.");
    }
    if (check.confirmed !== input.checked) {
      check.confirmed = input.checked;
      log.checkEvents.push({
        checkId: check.id,
        label: check.label,
        checked: input.checked,
        actor: demoActor(input.accountId),
        at: new Date().toISOString(),
      });
    }
    return { data: cloneLog(log) };
  }

  if (query.operation === 'removeWalkPhoto') {
    const { input } = query;
    const log = logs.find((item) => item.id === input.id);
    if (!log) return error(404, "This shift log doesn't exist.");
    // Saved photos are the record: only the Operations Manager removes them, on any date.
    if (!canDeleteWalkPhotos(input.accountId)) {
      return error(409, 'Only the Operations Manager can delete saved shift photos.');
    }
    log.walkPhotos = log.walkPhotos.filter((item) => item.id !== input.photoId);
    return { data: cloneLog(log) };
  }

  if (query.operation === 'addWalkPhotos') {
    const { input } = query;
    const log = logs.find((item) => item.id === input.id);
    if (!log) return error(404, "This shift log doesn't exist.");
    const dayLogs = logs.filter((item) => item.operationalDate === log.operationalDate);
    // Same rule as the checks: only today's open log, by the Shift Manager on duty.
    if (!canToggleChecks(input.accountId, log, dayLogs)) {
      return error(409, "Only today's open log can be changed, by the Shift Manager on duty.");
    }
    const actor = demoActor(input.accountId);
    const at = new Date().toISOString();
    for (const uri of query.input.uris) {
      walkPhotoCount += 1;
      log.walkPhotos.push({ id: `${log.id}-P${walkPhotoCount}`, uri, caption: null, actor, at });
    }
    return { data: cloneLog(log) };
  }

  if (query.operation === 'signOffLog') {
    const { input } = query;
    const log = logs.find((item) => item.id === input.id);
    if (!log) return error(404, "This shift log doesn't exist.");
    if (log.status === 'signedOff') return { data: cloneLog(log) };
    if (input.accountId !== requiredSignerAccountId(log)) {
      return error(409, requiredSignerMessage(log));
    }
    const dayLogs = logs.filter((item) => item.operationalDate === log.operationalDate);
    const blocked = sequenceBlockMessage(log, dayLogs);
    if (blocked) return error(409, blocked);

    const actor = demoActor(input.accountId);

    if (log.status === 'awaitingSecondSignOff') {
      // Night can't receive the handoff without acknowledging every open issue.
      const openIds = issues.filter((item) => item.status === 'open').map((item) => item.id);
      if (openIds.some((id) => !input.reviewedIssueIds.includes(id))) {
        return error(409, 'Review the open issues before receiving the handoff.');
      }
      const at = new Date().toISOString();
      if (openIds.length > 0) {
        log.issueReview = { issueIds: openIds, actor, at };
        log.checkEvents.push({
          checkId: `${log.id}-issues`,
          label: `Open issues reviewed (${openIds.length})`,
          checked: true,
          actor,
          at,
        });
      }
      log.signOffs.push({ actor, at });
      log.status = 'signedOff';
      return { data: cloneLog(log) };
    }

    if (!log.confirmations.every((item) => item.confirmed)) {
      return error(409, 'Confirm all three items before signing off.');
    }

    log.note = input.note.trim() || null;
    log.signOffs.push({ actor, at: new Date().toISOString() });
    log.status = log.phase === 'midday' ? 'awaitingSecondSignOff' : 'signedOff';
    return { data: cloneLog(log) };
  }

  if (query.operation === 'raiseIssue') {
    const { input } = query;
    if (!canManageIssues(input.accountId)) {
      return error(409, 'A Shift Manager must flag high-priority issues.');
    }
    const invalid = issueDraftError(input.category, input.details);
    if (invalid) return error(409, invalid);
    const photoUris = input.photoUris ?? [];
    if (photoUris.length > 5) return error(409, 'Attach no more than five photos at a time.');
    if (input.category === 'safety' && photoUris.length === 0) {
      return error(409, 'Add at least one evidence photo for a Safety hazard.');
    }
    const activeLog = logs.find(
      (log) =>
        log.operationalDate === localDateKey(new Date()) &&
        log.status !== 'signedOff' &&
        (input.accountId === 'jordan'
          ? log.phase === 'morning'
          : input.accountId === 'avery' && log.phase === 'night'),
    );
    const sourceLogId = input.sourceLogId ?? activeLog?.id;
    if (!sourceLogId || !logs.some((item) => item.id === sourceLogId)) {
      return error(404, "This shift log doesn't exist.");
    }
    const actor = demoActor(input.accountId);
    const at = new Date().toISOString();
    const photos = photoUris.map((uri, index) => ({
      id: `ISS-${String(issues.length + 1).padStart(3, '0')}-P${index + 1}`,
      uri,
      purpose: 'evidence' as const,
      takenBy: actor,
      takenAt: at,
    }));
    const issue: Issue = {
      id: `ISS-${String(issues.length + 1).padStart(3, '0')}`,
      category: input.category,
      details: input.details.trim(),
      sourceLogId,
      photos,
      status: 'open',
      raisedBy: actor,
      raisedAt: at,
      resolvedBy: null,
      resolvedAt: null,
      events: [
        { type: 'raised', actor, at },
        ...photos.map(() => ({ type: 'photoAdded' as const, actor, at })),
      ],
    };
    issues.unshift(issue);
    return { data: cloneIssue(issue) };
  }

  const { input } = query;
  const issue = issues.find((item) => item.id === input.id);
  if (!issue) return error(404, "This issue doesn't exist.");
  if (!canManageIssues(input.accountId)) {
    return error(409, 'A Shift Manager must resolve this issue.');
  }
  const photoUris = input.photoUris ?? [];
  if (photoUris.length > 5) return error(409, 'Attach no more than five photos at a time.');
  if (issue.status === 'open') {
    const actor = demoActor(input.accountId);
    const at = new Date().toISOString();
    issue.status = 'resolved';
    issue.resolvedBy = actor;
    issue.resolvedAt = at;
    for (const uri of photoUris) {
      issue.photos.push({
        id: `${issue.id}-R${issue.photos.length + 1}`,
        uri,
        purpose: 'resolution',
        takenBy: actor,
        takenAt: at,
      });
      issue.events.push({ type: 'photoAdded', actor, at });
    }
    issue.events.push({ type: 'resolved', actor, at });
  }
  return { data: cloneIssue(issue) };
};

export const logsApi = createApi({
  reducerPath: 'logsApi',
  baseQuery: mockBaseQuery,
  tagTypes: ['Log', 'Issue'],
  endpoints: (build) => ({
    getShiftLogs: build.query<readonly ShiftLog[], void>({
      query: () => ({ operation: 'listLogs' }),
      providesTags: (result) => [
        { type: 'Log', id: 'LIST' },
        ...(result?.map(({ id }) => ({ type: 'Log' as const, id })) ?? []),
      ],
    }),
    getShiftLog: build.query<ShiftLog, string>({
      query: (id) => ({ operation: 'detailLog', id }),
      providesTags: (_result, _error, id) => [{ type: 'Log', id }],
    }),
    getIssues: build.query<readonly Issue[], void>({
      query: () => ({ operation: 'listIssues' }),
      providesTags: [{ type: 'Issue', id: 'LIST' }],
    }),
    toggleLogCheck: build.mutation<ShiftLog, ToggleCheckInput>({
      query: (input) => ({ operation: 'toggleCheck', input }),
      // Flip the switch at once; the refetch brings back the logged event.
      async onQueryStarted(input, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          logsApi.util.updateQueryData('getShiftLog', input.id, (draft) => {
            const check = draft.confirmations.find((item) => item.id === input.checkId);
            if (check) check.confirmed = input.checked;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (_result, _error, input) => [
        { type: 'Log', id: input.id },
        { type: 'Log', id: 'LIST' },
      ],
    }),
    addWalkPhotos: build.mutation<ShiftLog, AddWalkPhotosInput>({
      query: (input) => ({ operation: 'addWalkPhotos', input }),
      invalidatesTags: (_result, _error, input) => [
        { type: 'Log', id: input.id },
        { type: 'Log', id: 'LIST' },
      ],
    }),
    removeWalkPhoto: build.mutation<ShiftLog, RemoveWalkPhotoInput>({
      query: (input) => ({ operation: 'removeWalkPhoto', input }),
      invalidatesTags: (_result, _error, input) => [
        { type: 'Log', id: input.id },
        { type: 'Log', id: 'LIST' },
      ],
    }),
    signOffShiftLog: build.mutation<ShiftLog, SignOffLogInput>({
      query: (input) => ({ operation: 'signOffLog', input }),
      invalidatesTags: (_result, _error, input) => [
        { type: 'Log', id: input.id },
        { type: 'Log', id: 'LIST' },
      ],
    }),
    raiseIssue: build.mutation<Issue, RaiseIssueInput>({
      query: (input) => ({ operation: 'raiseIssue', input }),
      invalidatesTags: [{ type: 'Issue', id: 'LIST' }],
    }),
    resolveIssue: build.mutation<Issue, ResolveIssueInput>({
      query: (input) => ({ operation: 'resolveIssue', input }),
      invalidatesTags: [{ type: 'Issue', id: 'LIST' }],
    }),
  }),
});

export const {
  useAddWalkPhotosMutation,
  useGetIssuesQuery,
  useGetShiftLogQuery,
  useGetShiftLogsQuery,
  useRaiseIssueMutation,
  useRemoveWalkPhotoMutation,
  useResolveIssueMutation,
  useSignOffShiftLogMutation,
  useToggleLogCheckMutation,
} = logsApi;
