import { AccessibilityInfo } from 'react-native';

import { usePhotoPicker } from '@/features/camera/usePhotoPicker';
import { useAppDispatch } from '@/store/hooks';

import { plural } from './WalkPhotos';
import { addWalkDrafts } from './walkDraftsSlice';

/**
 * Take or choose photos for one shift log. They land as unsaved drafts on that log, to be
 * reviewed and saved in its sheet. `onAdded` runs after photos arrive, e.g. to scroll to them.
 * With no `logId` (nothing open to add to) picked photos are ignored.
 */
export function useAddPhotos(logId: string | null, onAdded?: (logId: string) => void) {
  const dispatch = useAppDispatch();
  return usePhotoPicker((uris) => {
    if (logId === null || uris.length === 0) return;
    dispatch(addWalkDrafts(logId, uris));
    AccessibilityInfo.announceForAccessibility(`${plural(uris.length, 'photo')} ready to review`);
    onAdded?.(logId);
  });
}
