import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBsz7bMlHbAt320x0-IS4ZopZEzW-B70RY",
  authDomain: "car360-8eee0.firebaseapp.com",
  projectId: "car360-8eee0",
  storageBucket: "car360-8eee0.firebasestorage.app",
  messagingSenderId: "404227251099",
  appId: "1:404227251099:web:6c03baeb010ba09dc91f3e"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app)
export const auth = getAuth(app);
export const db = getFirestore(app);