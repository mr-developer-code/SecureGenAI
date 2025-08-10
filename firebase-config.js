// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCeH47satgBzunRPut2NZ49s1sEqJeRLuI",
  authDomain: "gen-ai-auth-d9c27.firebaseapp.com",
  projectId: "gen-ai-auth-d9c27",
  storageBucket: "gen-ai-auth-d9c27.firebasestorage.app",
  messagingSenderId: "584906950538",
  appId: "1:584906950538:web:94945691d21749f8046a73"
};

// Initialize Firebase
let auth;
try {
  const app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
  
  // Initialize Firebase Authentication
  auth = getAuth(app);
  console.log('Firebase Auth initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Create a fallback auth object to prevent errors
  auth = null;
}

export { auth }; 