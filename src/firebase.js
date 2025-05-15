// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBhViY_G9JQqE8Q_J9E6pQGLVcCvKPgdpQ",
  authDomain: "help-desk-phone-call-data.firebaseapp.com",
  projectId: "help-desk-phone-call-data",
  storageBucket: "help-desk-phone-call-data.firebasestorage.app",
  messagingSenderId: "984657860321",
  appId: "1:984657860321:web:247ee746c65a9d83d609a0",
  measurementId: "G-M0SKFWJKRV"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);