import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCRcKVtYYVz50TN9JhXBEVo9vECDkSJ6ik",
  authDomain: "swaroop-a03d9.firebaseapp.com",
  projectId: "swaroop-a03d9",
  storageBucket: "swaroop-a03d9.firebasestorage.app",
  messagingSenderId: "498150212901",
  appId: "1:498150212901:web:965dccb08962c3751606cc",
  measurementId: "G-JWRN3H2NLX"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app)
export const auth = getAuth(app);
export const db = getFirestore(app);
