// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ⚡ Thông tin config từ Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// APP CHO USER
export const appUser = initializeApp(firebaseConfig, "userApp");
export const authUser = getAuth(appUser);

// APP CHO ADMIN
export const appAdmin = initializeApp(firebaseConfig, "adminApp");
export const authAdmin = getAuth(appAdmin);

// Firestore dùng chung
export const db = getFirestore(appUser);

