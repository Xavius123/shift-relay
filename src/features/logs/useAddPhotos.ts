import { AccessibilityInfo } from 'react-native';

import { usePhotoPicker } from '@/features/camera/usePhotoPicker';
import { plural } from '@/features/common/plural';
import { useAppDispatch } from '@/store/hooks';

import { addWalkDrafts } from './walkDraftsSlice';

/**
 * Take or choose photos for one shift log. They land as unsaved drafts on that log, to be
 * reviewed and saved in its sheet. `onAdded` runs after photos arrive, e.g. to scroll to them.
 * With no `logId` (nothing open to add to) picked photos are ignored.
 */
export function useAddPhotos(logId: string | null, onAdded?: (logId: string) => void) {
  const dispatch = useAppDispatch();
  return usePhotoPicker((photos) => {
    if (logId === null || photos.length === 0) return;
    dispatch(addWalkDrafts(logId, photos));
    AccessibilityInfo.announceForAccessibility(`${plural(photos.length, 'photo')} ready to review`);
    onAdded?.(logId);
  });
}
