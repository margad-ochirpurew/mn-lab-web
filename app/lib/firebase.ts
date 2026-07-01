import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDnBYr23Pmw6Spg3qSO-bQFgUnE8Nci6t0",
  authDomain: "lobby-game-e39ee.firebaseapp.com",
  projectId: "lobby-game-e39ee",
  storageBucket: "lobby-game-e39ee.firebasestorage.app",
  messagingSenderId: "330119109863",
  appId: "1:330119109863:web:621dc153e688dd8e545642",
  measurementId: "G-SWH8VGHLKP"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };