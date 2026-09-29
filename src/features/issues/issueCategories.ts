import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import type { Issue, IssueCategory } from './types';

type IconName = ComponentProps<typeof Ionicons>['name'];

export const issueCategoryOrder = [
  'safety',
  'equipment',
  'security',
  'temperature',
  'other',
] as const satisfies readonly IssueCategory[];

export const issueCategories = {
  safety: { label: 'Safety hazard', icon: 'warning-outline' },
  equipment: { label: 'Equipment failure', icon: 'construct-outline' },
  security: { label: 'Security concern', icon: 'shield-outline' },
  temperature: { label: 'Temperature alarm', icon: 'thermometer-outline' },
  other: { label: 'Other', icon: 'create-outline' },
} as const satisfies Record<IssueCategory, { label: string; icon: IconName }>;

/** The line people read: the preset name, or the written description for Other. */
export function issueTitle(issue: Pick<Issue, 'category' | 'details'>): string {
  return issue.category === 'other' ? issue.details : issueCategories[issue.category].label;
}

/** Why a draft can't be raised yet, or null when it can. */
export function issueDraftError(category: IssueCategory | null, details: string): string | null {
  if (!category) return 'Choose what kind of issue this is.';
  if (category === 'other' && details.trim().length === 0) return 'Describe the issue.';
  return null;
}
