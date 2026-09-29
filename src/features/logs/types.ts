import type { DemoAccountId } from '@/features/auth/types';

export type ShiftPhase = 'morning' | 'midday' | 'night';
export type LogStatus = 'pending' | 'awaitingSecondSignOff' | 'signedOff';

export interface LogConfirmation {
  id: string;
  label: string;
  confirmed: boolean;
}

export interface LogSignOff {
  actor: string;
  at: string;
}

/** One flip of a required check, kept as the log's audit trail. */
export interface CheckEvent {
  checkId: string;
  label: string;
  checked: boolean;
  actor: string;
  at: string;
}

/** A shift photo, taken while the log is open. */
export interface WalkPhoto {
  id: string;
  /** A local file URI on iOS; a data or blob URI on web. Kept in memory only. */
  uri: string;
  /** What the photo shows, when known (the seed's drawings); null for photos taken in the app. */
  caption: string | null;
  actor: string;
  at: string;
}

/** Night's acknowledgement of the issues open when it received the Midday handoff. */
export interface IssueReview {
  issueIds: string[];
  actor: string;
  at: string;
}

export interface ShiftLog {
  id: string;
  operationalDate: string;
  phase: ShiftPhase;
  status: LogStatus;
  confirmations: LogConfirmation[];
  note: string | null;
  signOffs: LogSignOff[];
  /** Every check toggle, oldest first. */
  checkEvents: CheckEvent[];
  /** Midday only: set when Night receives the handoff with issues open. */
  issueReview: IssueReview | null;
  /** Shift photos, oldest first. */
  walkPhotos: WalkPhoto[];
}

export interface SignOffLogInput {
  id: string;
  note: string;
  /** On receiving the handoff: the open issues Night confirmed it reviewed. */
  reviewedIssueIds: string[];
  accountId: DemoAccountId;
}

export interface AddWalkPhotosInput {
  id: string;
  uris: string[];
  accountId: DemoAccountId;
}

export interface RemoveWalkPhotoInput {
  id: string;
  photoId: string;
  accountId: DemoAccountId;
}

export interface ToggleCheckInput {
  id: string;
  checkId: string;
  checked: boolean;
  accountId: DemoAccountId;
}

/** A photo in the full-size viewer, with where it was taken, e.g. "Morning · Sep 28". */
export interface PreviewPhoto {
  photo: WalkPhoto;
  context: string;
}
