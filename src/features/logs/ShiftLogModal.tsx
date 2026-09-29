import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef, useState } from 'react';
import { AccessibilityInfo, Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card, Input, makeStyles, Text, useTheme } from '@/design-system';
import { CloseButton } from '@/features/common/CloseButton';
import { Initials } from '@/features/common/Initials';
import { demoActor } from '@/features/auth/demoAccounts';
import { selectDemoAccountId } from '@/features/auth/sessionSlice';
import type { PickedPhoto } from '@/features/camera/types';
import { formatDateTime, formatDayFull } from '@/features/common/formatDate';
import { plural } from '@/features/common/plural';
import { LoadingState, ScreenState } from '@/features/common/ScreenState';
import { canManageIssues } from '@/features/issues/issuePermissions';
import { issueTitle } from '@/features/issues/issueCategories';
import { IssueRow } from '@/features/issues/IssueRow';
import { RaiseIssueForm } from '@/features/issues/RaiseIssueForm';
import { useAppSelector } from '@/store/hooks';

import { logStatusLabel } from './dailySheet';
import { phaseDescriptions, phaseLabels, todayKey } from './logTemplates';
import {
  canSignLog,
  canAddWalkPhotos,
  canToggleChecks,
  requiredSignerMessage,
  sequenceBlockMessage,
} from './logPermissions';
import {
  apiErrorMessage,
  isLogsApiError,
  useGetIssuesQuery,
  useGetShiftLogQuery,
  useGetShiftLogsQuery,
  useResolveIssueMutation,
  useSignOffShiftLogMutation,
  useToggleLogCheckMutation,
} from './logsApi';
import type { LogConfirmation } from './types';
import { SheetCameraBar } from './SheetCameraBar';
import { WalkPhotos } from './WalkPhotos';
import { selectWalkDrafts } from './walkDraftsSlice';

export interface ShiftLogModalProps {
  logId: string | null;
  onClose: () => void;
}

/**
 * One Morning, Midday handoff, or Night record over the screen that opened it.
 * Editable only for the account that owns the next step; read-only otherwise.
 */
export function ShiftLogModal({ logId, onClose }: ShiftLogModalProps) {
  const styles = useStyles();
  const [signOff, signOffResult] = useSignOffShiftLogMutation();

  const close = () => {
    if (signOffResult.isLoading) return;
    signOffResult.reset();
    onClose();
  };

  return (
    <Modal visible={logId !== null} transparent animationType="fade" onRequestClose={close}>
      <SafeAreaProvider>
        <View style={styles.scrim}>
          <Pressable
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel="Close shift log"
            testID="shift-log-backdrop"
            style={styles.backdrop}
          />
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <View
              style={styles.surface}
              aria-modal
              accessibilityViewIsModal
              testID="shift-log-modal"
            >
              {logId ? (
                <ShiftLogContent
                  key={logId}
                  logId={logId}
                  signOff={signOff}
                  signOffResult={signOffResult}
                  onClose={close}
                  onSigned={() => {
                    AccessibilityInfo.announceForAccessibility('Shift log signed off');
                    signOffResult.reset();
                    onClose();
                  }}
                />
              ) : null}
            </View>
          </SafeAreaView>
        </View>
      </SafeAreaProvider>
    </Modal>
  );
}

type SignOffHook = ReturnType<typeof useSignOffShiftLogMutation>;

function ShiftLogContent({
  logId,
  signOff,
  signOffResult,
  onClose,
  onSigned,
}: {
  logId: string;
  signOff: SignOffHook[0];
  signOffResult: SignOffHook[1];
  onClose: () => void;
  onSigned: () => void;
}) {
  const styles = useStyles();
  const theme = useTheme();
  const accountId = useAppSelector(selectDemoAccountId);
  const actor = demoActor(accountId);
  const { data: log, error, isError, isLoading, refetch } = useGetShiftLogQuery(logId);
  const logsQuery = useGetShiftLogsQuery();
  const issuesQuery = useGetIssuesQuery();
  const [resolveIssue, resolution] = useResolveIssueMutation();
  const [toggleCheck, toggleResult] = useToggleLogCheckMutation();
  const [note, setNote] = useState('');
  const [raising, setRaising] = useState(false);
  const [issuesReviewed, setIssuesReviewed] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const unsavedPhotos = useAppSelector((state) => selectWalkDrafts(state, logId)).length;
  const scrollRef = useRef<ScrollView>(null);

  if (isLoading) {
    return (
      <>
        <ModalHeader title="Shift log" onClose={onClose} busy={false} />
        <LoadingState label="Loading shift log" />
      </>
    );
  }

  if (isError || !log) {
    const notFound = isLogsApiError(error) && error.status === 404;
    return (
      <>
        <ModalHeader title="Shift log" onClose={onClose} busy={false} />
        <ScreenState
          title={notFound ? 'Shift log not found' : "Couldn't load shift log"}
          message={
            notFound ? "This shift log doesn't exist." : 'The shift log could not be loaded.'
          }
          {...(notFound ? {} : { actionLabel: 'Retry', onAction: () => void refetch() })}
          testID={notFound ? 'log-not-found' : 'log-error'}
        />
      </>
    );
  }

  const dayLogs = (logsQuery.data ?? []).filter(
    (item) => item.operationalDate === log.operationalDate,
  );
  const linkedIssues = (issuesQuery.data ?? []).filter((item) => item.sourceLogId === log.id);
  const openIssues = (issuesQuery.data ?? []).filter((item) => item.status === 'open');
  const canManage = canManageIssues(accountId);
  const canFlag = canManage && log.operationalDate === todayKey();
  const signed = log.status === 'signedOff';
  const awaitingSecond = log.status === 'awaitingSecondSignOff';
  const reviewed = signed || awaitingSecond;
  const canSign = canSignLog(accountId, log, dayLogs);
  const canToggle = canToggleChecks(accountId, log, dayLogs);
  const allChecked = log.confirmations.every((item) => item.confirmed);
  const blockedMessage = sequenceBlockMessage(log, dayLogs);
  const signerMessage = blockedMessage ?? requiredSignerMessage(log);
  const busy = signOffResult.isLoading;
  const mutationMessage = apiErrorMessage(
    signOffResult.error,
    'The log could not be signed off. Try again.',
  );
  const title = log.phase === 'midday' ? 'Midday handoff' : `${phaseLabels[log.phase]} shift`;
  const needsIssueReview = awaitingSecond && openIssues.length > 0;

  const submit = async () => {
    if (busy) return;
    if (!accountId || !canSign) {
      setValidationError(signerMessage);
      return;
    }
    // Shift photos come first: take them, review them, save them, then close the shift.
    if (!awaitingSecond && canToggle && unsavedPhotos > 0) {
      setValidationError(
        `Save or remove your ${plural(unsavedPhotos, 'unsaved shift photo')} before signing off.`,
      );
      return;
    }
    if (!awaitingSecond && !allChecked) {
      setValidationError('Confirm the restock check before signing off.');
      return;
    }
    if (needsIssueReview && !issuesReviewed) return;

    setValidationError(null);
    try {
      await signOff({
        id: log.id,
        note: awaitingSecond ? (log.note ?? '') : note,
        reviewedIssueIds:
          needsIssueReview && issuesReviewed ? openIssues.map((item) => item.id) : [],
        accountId,
      }).unwrap();
      onSigned();
    } catch {
      // RTK Query exposes the message below; the draft stays intact for retry.
    }
  };

  return (
    <>
      <ModalHeader
        title={title}
        subtitle={formatDayFull(log.operationalDate)}
        status={logStatusLabel(log)}
        statusVariant={signed ? 'success' : 'warning'}
        onClose={onClose}
        busy={busy}
      />
      <ScrollView ref={scrollRef} style={styles.body} contentContainerStyle={styles.bodyContent}>
        <Text tone="muted">{phaseDescriptions[log.phase]}</Text>

        <WalkPhotos log={log} accountId={accountId} canEdit={canAddWalkPhotos(accountId, log)} />

        <View style={styles.section}>
          <Text variant="title">Required checks</Text>
          {log.confirmations.map((item) => (
            <ConfirmationRow
              key={item.id}
              item={item}
              checked={item.confirmed}
              disabled={!canToggle}
              onToggle={() => {
                if (!accountId) return;
                setValidationError(null);
                void toggleCheck({
                  id: log.id,
                  checkId: item.id,
                  checked: !item.confirmed,
                  accountId,
                });
              }}
            />
          ))}
          {toggleResult.isError ? (
            <Text variant="bodySm" tone="error" weight="semibold" testID="check-toggle-error">
              {apiErrorMessage(toggleResult.error, 'The check could not be saved. Try again.')}
            </Text>
          ) : null}
        </View>

        <View style={styles.section} testID="log-issues">
          <View style={styles.titleRow}>
            <Text variant="title">Issues</Text>
            {canFlag && !raising ? (
              <Button
                variant="outline"
                size="sm"
                onPress={() => setRaising(true)}
                accessibilityLabel="Flag a high-priority issue on this log"
                testID="log-flag-issue"
              >
                Flag issue
              </Button>
            ) : null}
          </View>
          {raising && accountId ? (
            <RaiseIssueForm
              accountId={accountId}
              sourceLogId={log.id}
              onDone={() => setRaising(false)}
            />
          ) : null}
          {linkedIssues.map((issue) => (
            <IssueRow
              key={issue.id}
              issue={issue}
              {...(canManage && accountId
                ? {
                    resolve: {
                      loading: resolution.isLoading && resolution.originalArgs?.id === issue.id,
                      onResolve: async (photos: PickedPhoto[]) => {
                        await resolveIssue({ id: issue.id, accountId, photos }).unwrap();
                      },
                    },
                  }
                : {})}
            />
          ))}
          {linkedIssues.length === 0 && !raising ? (
            <Text variant="bodySm" tone="muted">
              No issues flagged on this log.
            </Text>
          ) : null}
        </View>

        <Input
          label="Shift note"
          value={reviewed ? (log.note ?? '') : note}
          onChangeText={setNote}
          placeholder="Optional context for the next crew"
          helperText="Optional"
          multiline
          disabled={reviewed || !canSign}
          testID="log-note"
        />

        {!reviewed && !canSign ? (
          <Card testID="signer-required">
            <Text variant="bodySm" weight="semibold">
              {signerMessage}
            </Text>
            <Text variant="caption" tone="muted">
              {blockedMessage
                ? 'The day runs Morning, then the handoff, then Night.'
                : 'Sign in with the required Shift Manager account to complete this form.'}
            </Text>
          </Card>
        ) : null}

        {reviewed ? (
          <Card testID="log-sign-off-summary">
            <Text variant="title">{signed ? 'Sign-off complete' : 'Awaiting second sign-off'}</Text>
            <Text
              variant="bodySm"
              tone="muted"
            >{`${linkedIssues.length} issues · ${linkedIssues.reduce((count, issue) => count + issue.photos.length, 0)} issue photos from this log`}</Text>
            {log.signOffs.map((signOff, index) => (
              <View key={`${signOff.actor}-${signOff.at}`} style={styles.personRow}>
                <Initials names={[signOff.actor]} size="md" />
                <View style={styles.signOffRow}>
                  <Text variant="bodySm" weight="semibold">
                    {log.phase === 'midday'
                      ? `${index === 0 ? 'Morning sent' : 'Night received'} · ${signOff.actor}`
                      : signOff.actor}
                  </Text>
                  <Text variant="caption" tone="muted">
                    {formatDateTime(signOff.at)}
                  </Text>
                </View>
              </View>
            ))}
            {log.issueReview ? (
              <Text variant="caption" tone="muted" testID="handoff-issues-acknowledged">
                {`${log.issueReview.actor} reviewed ${log.issueReview.issueIds.length} open issues on receipt`}
              </Text>
            ) : null}
            {awaitingSecond ? (
              <View style={styles.section} testID="second-sign-off">
                <Text variant="bodySm" tone="muted">
                  Avery Smith, Night Shift Manager, must review and receive Jordan&apos;s Morning
                  handoff.
                </Text>
                <Text variant="caption" tone="subtle">
                  {`Reviewing as ${actor}`}
                </Text>
                {!canSign ? (
                  <Text variant="bodySm" tone="error" weight="semibold">
                    Switch to Avery&apos;s account to receive this handoff.
                  </Text>
                ) : null}
                {needsIssueReview ? (
                  <View style={styles.section} testID="handoff-issue-review">
                    <ConfirmationRow
                      item={{
                        id: `${log.id}-issues`,
                        label: `Open issues reviewed (${openIssues.length})`,
                        confirmed: issuesReviewed,
                      }}
                      checked={issuesReviewed}
                      disabled={!canSign}
                      onToggle={() => setIssuesReviewed((current) => !current)}
                    />
                    {openIssues.map((issue) => (
                      <Text key={issue.id} variant="caption" tone="muted">
                        {`• ${issueTitle(issue)}`}
                      </Text>
                    ))}
                  </View>
                ) : null}
                {signOffResult.isError ? (
                  <Text variant="bodySm" tone="error" weight="semibold">
                    {mutationMessage}
                  </Text>
                ) : null}
                <Button
                  onPress={() => void submit()}
                  loading={busy}
                  disabled={!canSign || (needsIssueReview && !issuesReviewed)}
                  accessibilityLabel="Receive and sign the Midday handoff"
                  testID="approve-second-sign-off"
                >
                  Receive and sign off
                </Button>
              </View>
            ) : null}
          </Card>
        ) : (
          <View style={styles.section}>
            {validationError ? (
              <Card testID="log-validation-error">
                <Text variant="bodySm" tone="error" weight="semibold">
                  {validationError}
                </Text>
              </Card>
            ) : null}

            {signOffResult.isError ? (
              <Card testID="log-mutation-error">
                <Text variant="bodySm" tone="error" weight="semibold">
                  {mutationMessage}
                </Text>
              </Card>
            ) : null}

            <Text variant="caption" tone="subtle">
              {canSign ? `Signing as ${actor}` : signerMessage}
            </Text>
            <Button
              onPress={() => void submit()}
              loading={busy}
              disabled={!canSign}
              accessibilityLabel="Sign off shift log"
              testID="sign-off-log"
            >
              Sign off log
            </Button>
          </View>
        )}

        {log.checkEvents.length > 0 ? (
          <View style={styles.history}>
            <Pressable
              onPress={() => setHistoryOpen((current) => !current)}
              accessibilityRole="button"
              accessibilityLabel={`Check history, ${log.checkEvents.length} events`}
              aria-expanded={historyOpen}
              testID="check-history-toggle"
              style={({ pressed }) => [styles.historyToggle, pressed && styles.pressed]}
            >
              <Text variant="bodySm" weight="semibold">
                {`Check history (${log.checkEvents.length})`}
              </Text>
              <Ionicons
                name={historyOpen ? 'chevron-up' : 'chevron-down'}
                size={theme.fontSize.base}
                color={theme.color.textMuted}
              />
            </Pressable>
            {historyOpen ? (
              <View style={styles.historyBody} testID="check-events">
                {[...log.checkEvents].reverse().map((event) => (
                  <View key={`${event.checkId}-${event.at}`} style={styles.personRow}>
                    <Initials names={[event.actor]} />
                    <View style={styles.eventRow}>
                      <Text variant="bodySm">
                        {`${event.actor} ${event.checked ? 'checked' : 'unchecked'} ${event.label}`}
                      </Text>
                      <Text variant="caption" tone="muted">
                        {formatDateTime(event.at)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
      <SheetCameraBar
        log={log}
        accountId={accountId}
        onAdded={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
      />
    </>
  );
}

function ModalHeader({
  title,
  subtitle,
  status,
  statusVariant,
  onClose,
  busy,
}: {
  title: string;
  subtitle?: string;
  status?: string;
  statusVariant?: 'success' | 'warning';
  onClose: () => void;
  busy: boolean;
}) {
  const styles = useStyles();
  return (
    <View style={styles.header}>
      <View style={styles.copy}>
        <Text variant="title">{title}</Text>
        {subtitle ? (
          <Text variant="bodySm" tone="muted">
            {subtitle}
          </Text>
        ) : null}
        {status ? (
          <View style={styles.statusRow}>
            <Badge variant={statusVariant ?? 'default'} testID="log-status">
              {status}
            </Badge>
          </View>
        ) : null}
      </View>
      <CloseButton
        onPress={onClose}
        disabled={busy}
        accessibilityLabel={`Close ${title}`}
        testID="close-shift-log"
      />
    </View>
  );
}

function ConfirmationRow({
  item,
  checked,
  disabled,
  onToggle,
}: {
  item: LogConfirmation;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={item.label}
      aria-checked={checked}
      aria-disabled={disabled}
      testID={`confirmation-${item.id}`}
      style={({ pressed }) => [
        styles.confirmation,
        checked && styles.confirmationChecked,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <View style={styles.copy}>
        <Text variant="bodySm" weight="medium">
          {item.label}
        </Text>
      </View>
      <View style={[styles.track, checked && styles.trackOn, disabled && styles.trackDisabled]}>
        <View style={[styles.thumb, checked && styles.thumbOn]} />
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  scrim: { flex: 1, backgroundColor: t.color.overlay },
  backdrop: {
    position: 'absolute',
    top: t.spacing[0],
    right: t.spacing[0],
    bottom: t.spacing[0],
    left: t.spacing[0],
  },
  safeArea: {
    flex: 1,
    // Let taps outside the dialog fall through to the backdrop.
    pointerEvents: 'box-none',
    justifyContent: 'center',
    alignItems: 'center',
    padding: t.spacing[4],
  },
  surface: {
    width: '100%',
    maxWidth: t.size.content,
    maxHeight: '100%',
    flexShrink: 1,
    backgroundColor: t.color.surface,
    borderRadius: t.radius.lg,
    boxShadow: t.shadow.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: t.spacing[3],
    padding: t.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: t.color.border,
  },
  statusRow: { flexDirection: 'row', paddingTop: t.spacing[1] },
  body: { flexShrink: 1 },
  bodyContent: { gap: t.spacing[6], padding: t.spacing[4], paddingBottom: t.spacing[8] },
  section: { gap: t.spacing[3] },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: t.spacing[3],
  },
  copy: { flex: 1, gap: t.spacing[1] },
  confirmation: {
    minHeight: t.size.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing[3],
    padding: t.spacing[3],
    backgroundColor: t.color.surface,
    borderWidth: 1,
    borderColor: t.color.border,
    borderRadius: t.radius.md,
  },
  confirmationChecked: { borderColor: t.color.success, backgroundColor: t.color.successBg },
  pressed: { opacity: t.opacity.pressed },
  track: {
    width: t.spacing[12],
    height: t.spacing[6] + t.spacing[1],
    padding: t.spacing[1] / 2,
    justifyContent: 'center',
    borderRadius: t.radius.full,
    backgroundColor: t.color.borderStrong,
  },
  trackOn: { backgroundColor: t.color.success },
  trackDisabled: { opacity: t.opacity.disabled },
  thumb: {
    width: t.spacing[6],
    height: t.spacing[6],
    borderRadius: t.radius.full,
    backgroundColor: t.color.surface,
  },
  thumbOn: { alignSelf: 'flex-end' },
  eventRow: { gap: t.spacing[1] },
  history: {
    borderWidth: 1,
    borderColor: t.color.border,
    borderRadius: t.radius.md,
    overflow: 'hidden',
  },
  historyToggle: {
    minHeight: t.size.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: t.spacing[3],
    backgroundColor: t.color.bgSubtle,
  },
  historyBody: { gap: t.spacing[3], padding: t.spacing[3] },
  signOffRow: { flex: 1, gap: t.spacing[1] },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[3] },
}));
