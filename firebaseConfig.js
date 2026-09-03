// Firebase configuration for gym-ai-coach
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAB4dhFrRc7J2b2miwW5WwS197FITdKCo4",
  authDomain: "gym-ai-coach-5b5b5.firebaseapp.com",
  projectId: "gym-ai-coach-5b5b5",
  storageBucket: "gym-ai-coach-5b5b5.firebasestorage.app",
  messagingSenderId: "473849273566",
  appId: "1:473849273566:web:5c3aac0adf7c0b496d364f",
  measurementId: "G-VP0NRNP2KF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics (optional, comentar si no lo necesitas)
let analytics;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.log("Analytics not available in this environment");
}

export default app;