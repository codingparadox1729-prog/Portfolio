import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Replace the values below with your actual keys from Step 3
const firebaseConfig = {
  apiKey: "AIzaSyBcb9szMGtzurNupPhiG_ZPcTVYcrjv7jA",
  authDomain: "codingparadox-portfolio.firebaseapp.com",
  projectId: "codingparadox-portfolio",
  storageBucket: "codingparadox-portfolio.firebasestorage.app",
  messagingSenderId: "918702015853",
  appId: "1:918702015853:web:fe7002abc0b017c818c664",
  measurementId: "G-EER0GMMXR5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
