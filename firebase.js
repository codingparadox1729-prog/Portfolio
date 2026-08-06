/* ==========================================================================
   Firebase Infrastructure & Realtime Database Initialization
   ========================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBcb9szMGtzurNupPhiG_ZPcTVYcrjv7jA",
  authDomain: "codingparadox-portfolio.firebaseapp.com",
  projectId: "codingparadox-portfolio",
  storageBucket: "codingparadox-portfolio.firebasestorage.app",
  messagingSenderId: "918702015853",
  appId: "1:918702015853:web:fe7002abc0b017c818c664",
  measurementId: "G-EER0GMMXR5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, onValue, set };
