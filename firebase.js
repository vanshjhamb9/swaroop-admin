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
  authDomain: "uplai-aeff0.firebaseapp.com",
  projectId: "uplai-aeff0",
  storageBucket: "uplai-aeff0.firebasestorage.app",
  messagingSenderId: "102642574058",
  appId: "1:102642574058:web:7a6b57ffaa1960dd367c36",
  measurementId: "G-JWRN3H2NLX"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app)
export const auth = getAuth(app);
export const db = getFirestore(app);
