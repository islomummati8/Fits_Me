import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBEfjUJHn9-R4-ioRMtc8WRiXnrstXB-Co",
  authDomain: "fits-me-online.firebaseapp.com",
  projectId: "fits-me-online",
  storageBucket: "fits-me-online.firebasestorage.app",
  messagingSenderId: "848597996215",
  appId: "1:848597996215:web:3218fc31b864fcde2df332"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);