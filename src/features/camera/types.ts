/** Where a photo came from: taken with a camera, or uploaded from a file or the photo library. */
export type PhotoSource = 'camera' | 'upload';

export interface PickedPhoto {
  uri: string;
  source: PhotoSource;
}
