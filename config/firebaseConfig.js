require('dotenv').config();
const { initializeApp } = require("@firebase/app");
const {  doc, collection, getDoc, deleteDoc } = require("firebase/firestore");

// import { getAnalytics } from "firebase/analytics";

const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} = require("@firebase/auth");
const { getFirestore } = require("firebase/firestore");

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAXzMq2vTVGX3tvwB8uDiqpuJN-wNPW8U",
  authDomain: "matrimony-8ff59.firebaseapp.com",
  projectId: "matrimony-8ff59",
  storageBucket: "matrimony-8ff59.firebasestorage.app",
  messagingSenderId: "767043525258",
  appId: "1:767043525258:web:226f8b7cef767b79edeb73",
  measurementId: "G-7L26EY99JJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Get the auth instance
const db = getFirestore(app); // Get the firestore instance

module.exports = {
  app,
  auth, // Export the auth instance
  db,
  doc,
  getDoc,
  createUserWithEmailAndPassword, // Export this if needed
  signInWithEmailAndPassword, // Export this so you can use it in your code
  sendPasswordResetEmail
};
