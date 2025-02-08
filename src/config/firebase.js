// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAksVje9u80MdctjHqqjzAk2pEcgg9qTj8",
    authDomain: "nimo-76a15.firebaseapp.com",
    projectId: "nimo-76a15",
    storageBucket: "nimo-76a15.firebasestorage.app",
    messagingSenderId: "466484695809",
    appId: "1:466484695809:web:f16144e1e7c82f77118100",
    measurementId: "G-T0CKCQ46ZX"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Sign in function
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    // console.log("User Info:", result.user);
  } catch (error) {
    console.error("Error signing in:", error);
  }
};

// Sign out function
const logOut = async () => {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

export { auth, signInWithGoogle, logOut };
