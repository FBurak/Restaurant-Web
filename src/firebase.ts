import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyDjyHwhHY8tcQ4PWfGvFMw7TXHrEDm5hwQ",
  authDomain: "restaurant-page-33174.firebaseapp.com",
  projectId: "restaurant-page-33174",
  storageBucket: "restaurant-page-33174.firebasestorage.app",
  messagingSenderId: "548698307386",
  appId: "1:548698307386:web:c131fff7db9d76763eee03"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);