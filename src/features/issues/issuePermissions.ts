import { isShiftManagerAccount } from '@/features/auth/demoAccounts';
import type { DemoAccountId } from '@/features/auth/types';

/** Shift Managers flag and resolve issues; the Operations Manager observes them. */
export function canManageIssues(accountId: DemoAccountId | null): boolean {
  return isShiftManagerAccount(accountId);
}
