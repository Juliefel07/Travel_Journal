
import { collection, addDoc } from 'firebase/firestore';
import { db } from './config';

export const saveTravelEntry = async ({ userId, title, description, imageUrl, timestamp }) => {
  try {
    const docRef = await addDoc(collection(db, 'travelEntries'), {
      userId: user.uid,
  title: title.trim(),
  description: desc.trim(),
  timestamp: serverTimestamp(),
    });

    return docRef.id; 
  } catch (error) {
    console.error('Error saving travel entry:', error);
    throw error;
  }
};