// C:\Users\ASUS\meditrack-ai\frontend\src\firebase.js
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged // Listens to authentication state changes
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc 
} from "firebase/firestore";

// Your web app's Firebase configuration - Get these from your Firebase project settings
// IMPORTANT: Replace these with your actual keys from frontend/.env.local
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get service instances
const auth = getAuth(app); // Firebase Authentication service
const db = getFirestore(app); // Firestore Database service

// Export the initialized services and commonly used functions
export {
  app,        // The initialized Firebase app instance
  auth,       // Firebase Authentication service
  db,         // Firestore Database service

  // Firebase Auth functions
  createUserWithEmailAndPassword, // For creating new users
  signInWithEmailAndPassword,     // For signing in existing users
  signOut,                        // For logging out users
  onAuthStateChanged,             // For listening to authentication state changes

  // Firestore functions
  doc,                            // For creating a DocumentReference
  setDoc,                         // For setting document data (e.g., creating user profile)
  getDoc,                         // For getting document data
  updateDoc,                      // For updating document data
  collection,                     // For creating a CollectionReference
  addDoc                          // For adding a new document with an auto-generated ID
};