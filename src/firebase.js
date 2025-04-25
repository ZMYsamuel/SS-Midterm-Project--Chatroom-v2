// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD4l0R25ORIY9aOsnzjFEyLV-teIsKwqmc",
  authDomain: "ss-midterm-project-chatroom-v2.firebaseapp.com",
  projectId: "ss-midterm-project-chatroom-v2",
  storageBucket: "ss-midterm-project-chatroom-v2.firebasestorage.app",
  messagingSenderId: "271884094775",
  appId: "1:271884094775:web:4c449ae499eeab52819eb2",
  measurementId: "G-S4KH4YR1RX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export { auth, db };