import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPn9wQw-OQUeUITLED3F2Es8-Hh6WEbiA",
  authDomain: "traveljourney-efcd4.firebaseapp.com",
  projectId: "traveljourney-efcd4",
  storageBucket: "traveljourney-efcd4.appspot.com", // ✅ FIXED THIS LINE
  messagingSenderId: "947486983997",
  appId: "1:947486983997:web:7ad63aba146c084aa8e754"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
