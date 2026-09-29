import type { DemoAccountId } from '@/features/auth/types';
import type { PhotoSource, PickedPhoto } from '@/features/camera/types';

/** The preset high-priority kinds a Shift Manager can pick, plus a written-in Other. */
export type IssueCategory = 'safety' | 'equipment' | 'security' | 'temperature' | 'other';
export type IssueStatus = 'open' | 'resolved';

export interface IssueEvent {
  type: 'raised' | 'resolved' | 'photoAdded';
  actor: string;
  at: string;
}

export interface IssuePhoto {
  id: string;
  uri: string;
  purpose: 'evidence' | 'resolution';
  /** Taken with a camera, or uploaded from a file or the photo library. */
  source: PhotoSource;
  takenBy: string;
  takenAt: string;
}

export interface Issue {
  id: string;
  category: IssueCategory;
  /** Extra context for a preset; the whole description for Other. */
  details: string;
  /** The shift log this issue belongs to. */
  sourceLogId: string;
  photos: IssuePhoto[];
  status: IssueStatus;
  raisedBy: string;
  raisedAt: string;
  resolvedBy: string | null;
  resolvedAt: string | null;
  /** Raised, then resolved: the issue's audit trail, oldest first. */
  events: IssueEvent[];
}

export interface RaiseIssueInput {
  category: IssueCategory;
  details: string;
  sourceLogId: string | null;
  photos?: PickedPhoto[];
  accountId: DemoAccountId;
}

export interface ResolveIssueInput {
  id: string;
  accountId: DemoAccountId;
  photos?: PickedPhoto[];
}
