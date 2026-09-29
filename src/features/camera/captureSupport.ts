import { Platform } from 'react-native';

/**
 * Whether this device can take a photo with a camera. Native builds always can. On web, only a
 * touch-first device (a phone or tablet browser) can; a desktop browser gives a file picker, so
 * the app calls that an upload rather than promising a camera.
 */
export function hasCamera(): boolean {
  if (Platform.OS !== 'web') return true;
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(pointer: coarse)').matches;
}
