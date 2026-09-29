import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Platform } from 'react-native';

export interface PickerError {
  message: string;
  /** iOS stops prompting after a denial; the user has to allow it in Settings. */
  openSettings: boolean;
}

const pickerOptions: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7 };

/**
 * Take a photo with the camera or pick some from the library. `onPicked` gets the URIs;
 * a cancel gives nothing. Web opens a file input, so a test can supply the image.
 */
export function usePhotoPicker(onPicked: (uris: string[]) => void) {
  const [error, setError] = useState<PickerError | null>(null);
  // Which button is working, so only that one shows a spinner.
  const [working, setWorking] = useState<'camera' | 'library' | null>(null);

  const handle = (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled) onPicked(result.assets.map((asset) => asset.uri));
  };

  const takePhoto = async () => {
    setError(null);
    setWorking('camera');
    try {
      // Web opens a file input straight from the tap; there is no permission prompt to await.
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setError({
            message: 'Camera access is off. Allow it to take photos.',
            openSettings: !permission.canAskAgain,
          });
          return;
        }
      }
      handle(await ImagePicker.launchCameraAsync(pickerOptions));
    } catch {
      setError({ message: "Couldn't open the camera. Try again.", openSettings: false });
    } finally {
      setWorking(null);
    }
  };

  const choosePhotos = async () => {
    setError(null);
    setWorking('library');
    try {
      // The iOS system photo picker needs no library permission.
      handle(
        await ImagePicker.launchImageLibraryAsync({
          ...pickerOptions,
          allowsMultipleSelection: true,
          selectionLimit: 10,
        }),
      );
    } catch {
      setError({ message: "Couldn't open your photos. Try again.", openSettings: false });
    } finally {
      setWorking(null);
    }
  };

  const clearError = () => setError(null);

  return { takePhoto, choosePhotos, busy: working !== null, working, error, clearError };
}
