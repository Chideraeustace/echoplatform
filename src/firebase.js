// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Add this line

const firebaseConfig = {
  apiKey: "AIzaSyDR6RwgryleYXoO2l442WVX1Pu3hAsaTs8",
  authDomain: "eustech-c4332.firebaseapp.com",
  projectId: "eustech-c4332",
  storageBucket: "eustech-c4332.firebasestorage.app",
  messagingSenderId: "78506944447",
  appId: "1:78506944447:web:27ba9745783ee6a1ad630a",
  measurementId: "G-J1HYRTHNZZ",
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Export database instance
