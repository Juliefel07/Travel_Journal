
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';
import { v4 as uuidv4 } from 'uuid';

export const uploadTravelImage = async (uri) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `images/${uuidv4()}`;
    const imageRef = ref(storage, filename);

    await uploadBytes(imageRef, blob);
    const downloadUrl = await getDownloadURL(imageRef);

    return downloadUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
