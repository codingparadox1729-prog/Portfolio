// Import Firebase Modular SDKs via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Your Firebase Configuration Object (Replace with your keys from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyBcb9szMGtzurNupPhiG_ZPcTVYcrjv7jA",
  authDomain: "codingparadox-portfolio.firebaseapp.com",
  databaseURL: "https://codingparadox-portfolio-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "codingparadox-portfolio",
  storageBucket: "codingparadox-portfolio.firebasestorage.app",
  messagingSenderId: "918702015853",
  appId: "1:918702015853:web:fe7002abc0b017c818c664",
  measurementId: "G-EER0GMMXR5"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Export Firebase methods for usage in script.js and admin.js
export { database, ref, set, push, onValue, remove, update };
