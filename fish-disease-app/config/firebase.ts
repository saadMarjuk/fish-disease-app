import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyC3oBTxAaL3-W9WKeUl54vgWWnaLlPzpU8',
  authDomain: 'fish-disease-detect-app.firebaseapp.com',
  projectId: 'fish-disease-detect-app',
  storageBucket: 'fish-disease-detect-app.firebasestorage.app',
  messagingSenderId: '384470003273',
  appId: '1:384470003273:web:20f41900da861f94e95998',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);