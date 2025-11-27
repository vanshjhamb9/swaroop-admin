import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBemry5DfDwI1DuI4YZB7wC20WhFb7_pww",
  authDomain: "uplai-90c96.firebaseapp.com",
  projectId: "uplai-90c96",
  storageBucket: "uplai-90c96.firebasestorage.app",
  messagingSenderId: "498150212901",
  appId: "1:498150212901:web:965dccb08962c3751606cc",
  measurementId: "G-JWRN3H2NLX"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app)
export const auth = getAuth(app);
export const db = getFirestore(app);
