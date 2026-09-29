import { confirmationTemplates, localDateKey, logId, phaseOrder } from './logTemplates';
import type { Issue } from '@/features/issues/types';

import { seedWalkPhotos } from './generated/seedWalkPhotos';

import type { ShiftLog, WalkPhoto } from './types';

const morningManager = 'Jordan Lee';
const nightManager = 'Avery Smith';

function dateBeforeToday(daysAgo: number): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function timestampFor(date: Date, hour: number): string {
  const timestamp = new Date(date);
  timestamp.setHours(hour, 15, 0, 0);
  return timestamp.toISOString();
}

/** Every signed-off shift has one or two photos: [Morning, Midday, Night], repeating by day. */
const dailyPhotoCounts = [
  [2, 1, 1],
  [1, 1, 1],
  [1, 2, 1],
] as const;

function seedPhotos(
  id: string,
  daysAgo: number,
  phase: (typeof phaseOrder)[number],
  actor: string,
  before: string,
): WalkPhoto[] {
  const phaseIndex = phaseOrder.indexOf(phase);
  const counts = dailyPhotoCounts[(daysAgo - 1) % dailyPhotoCounts.length];
  const count = counts?.[phaseIndex] ?? 0;
  return Array.from({ length: count }, (_, index) => {
    const image =
      seedWalkPhotos[
        (daysAgo + phaseIndex * 2 + index + (phase === 'night' ? 1 : 0)) % seedWalkPhotos.length
      ];
    // seedWalkPhotos is a fixed, non-empty generated list, so the modulo always lands on one.
    if (!image) throw new Error('seed shift photos missing');
    return {
      id: `${id}-P${index + 1}`,
      uri: image.uri,
      caption: image.label,
      actor,
      // Taken during the shift, before the checks were ticked and the log signed.
      at: new Date(new Date(before).getTime() - (20 - index * 3) * 60_000).toISOString(),
    };
  });
}

function createLog(
  date: string,
  phase: (typeof phaseOrder)[number],
  /** Null for today's pending logs; days back for signed history. */
  daysAgo: number | null,
): ShiftLog {
  const signed = daysAgo !== null;
  const labels = confirmationTemplates[phase];
  const logDate = new Date(`${date}T12:00:00`);
  const signOffs = !signed
    ? []
    : phase === 'midday'
      ? [
          { actor: morningManager, at: timestampFor(logDate, 12) },
          { actor: nightManager, at: timestampFor(logDate, 13) },
        ]
      : [
          {
            actor: phase === 'morning' ? morningManager : nightManager,
            at: timestampFor(logDate, phase === 'morning' ? 8 : 20),
          },
        ];
  const confirmations = labels.map((label, index) => ({
    id: `${logId(date, phase)}-C${index + 1}`,
    label,
    confirmed: signed,
  }));
  // Signed history: the first signer ticked each check in the minutes before signing.
  const firstSignOff = signOffs[0];
  const checkEvents = firstSignOff
    ? confirmations.map((item, index) => ({
        checkId: item.id,
        label: item.label,
        checked: true,
        actor: firstSignOff.actor,
        at: new Date(
          new Date(firstSignOff.at).getTime() - (confirmations.length - index) * 60_000,
        ).toISOString(),
      }))
    : [];
  return {
    id: logId(date, phase),
    operationalDate: date,
    phase,
    status: signed ? 'signedOff' : 'pending',
    confirmations,
    note: signed ? `${phase[0]?.toUpperCase()}${phase.slice(1)} review completed.` : null,
    signOffs,
    checkEvents,
    issueReview: null,
    // Fictional drawings, never real facilities (scripts/build-seed-photos.mjs).
    walkPhotos:
      daysAgo !== null && firstSignOff
        ? seedPhotos(logId(date, phase), daysAgo, phase, firstSignOff.actor, firstSignOff.at)
        : [],
  };
}

export function createSeedData(): { logs: ShiftLog[]; issues: Issue[] } {
  const logs: ShiftLog[] = [];

  const today = localDateKey(new Date());
  for (const phase of phaseOrder) logs.push(createLog(today, phase, null));

  for (let daysAgo = 1; daysAgo <= 21; daysAgo += 1) {
    const date = localDateKey(dateBeforeToday(daysAgo));
    for (const phase of phaseOrder) logs.push(createLog(date, phase, daysAgo));
  }

  const issueSeeds = [
    {
      daysAgo: 1,
      phase: 'night',
      category: 'safety',
      details: 'First-aid cabinet needs restocking before opening.',
      open: true,
    },
    {
      daysAgo: 4,
      phase: 'midday',
      category: 'equipment',
      details: 'Loading bay door sensor repair not yet verified.',
      open: true,
    },
    {
      daysAgo: 7,
      phase: 'morning',
      category: 'safety',
      details: 'Spill kit seal damaged.',
      open: false,
    },
    {
      daysAgo: 10,
      phase: 'night',
      category: 'temperature',
      details: 'Freezer alarm calibration drifted.',
      open: false,
    },
    {
      daysAgo: 14,
      phase: 'midday',
      category: 'other',
      details: 'Reconcile missing scanner battery',
      open: false,
    },
    {
      daysAgo: 19,
      phase: 'morning',
      category: 'security',
      details: 'Side gate found unlatched at opening.',
      open: false,
    },
  ] as const;

  const issues = issueSeeds.map((seed, index): Issue => {
    const sourceDate = dateBeforeToday(seed.daysAgo);
    const raisedAt = timestampFor(sourceDate, seed.phase === 'morning' ? 9 : 18);
    const raisedBy = seed.phase === 'night' ? nightManager : morningManager;
    const resolvedBy = seed.open
      ? null
      : raisedBy === morningManager
        ? nightManager
        : morningManager;
    const resolvedAt = seed.open ? null : timestampFor(sourceDate, 20);
    const evidenceImage = seedWalkPhotos[index % seedWalkPhotos.length];
    const resolutionImage = seedWalkPhotos[(index + 2) % seedWalkPhotos.length];
    const evidence =
      evidenceImage && index < 4
        ? [
            {
              id: `ISS-${String(index + 1).padStart(3, '0')}-P1`,
              uri: evidenceImage.uri,
              purpose: 'evidence' as const,
              takenBy: raisedBy,
              takenAt: raisedAt,
            },
          ]
        : [];
    const resolution =
      resolutionImage && resolvedBy && resolvedAt && (index === 2 || index === 3)
        ? [
            {
              id: `ISS-${String(index + 1).padStart(3, '0')}-R1`,
              uri: resolutionImage.uri,
              purpose: 'resolution' as const,
              takenBy: resolvedBy,
              takenAt: resolvedAt,
            },
          ]
        : [];
    return {
      id: `ISS-${String(index + 1).padStart(3, '0')}`,
      category: seed.category,
      details: seed.details,
      sourceLogId: logId(localDateKey(sourceDate), seed.phase),
      photos: [...evidence, ...resolution],
      status: seed.open ? 'open' : 'resolved',
      raisedBy,
      raisedAt,
      resolvedBy,
      resolvedAt,
      events: [
        { type: 'raised', actor: raisedBy, at: raisedAt },
        ...evidence.map(() => ({ type: 'photoAdded' as const, actor: raisedBy, at: raisedAt })),
        ...resolution.map(() => ({
          type: 'photoAdded' as const,
          actor: resolvedBy ?? raisedBy,
          at: resolvedAt ?? raisedAt,
        })),
        ...(resolvedBy && resolvedAt
          ? [{ type: 'resolved' as const, actor: resolvedBy, at: resolvedAt }]
          : []),
      ],
    };
  });

  return { logs, issues };
}
