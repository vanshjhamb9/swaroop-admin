import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsXKA7YTGRlpyTHm7042dxSBXrOQNXMRk",
  authDomain: "uplai-aeff0.firebaseapp.com",
  projectId: "uplai-aeff0",
  storageBucket: "uplai-aeff0.firebasestorage.app",
  messagingSenderId: "936722319294",
  appId: "1:936722319294:web:1769182224440382bfdbef",
  measurementId: "G-HHPE50DRNV"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app)
export const auth = getAuth(app);
export const db = getFirestore(app);
