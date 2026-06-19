import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewx-ai-f4166.firebaseapp.com",
  projectId: "interviewx-ai-f4166",
  storageBucket: "interviewx-ai-f4166.firebasestorage.app",
  messagingSenderId: "336353033707",
  appId: "1:336353033707:web:c1b99958d6aa0dac376dae",
  measurementId: "G-WHQ0EN2WDJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, analytics };
