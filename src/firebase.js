// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Primary Firestore (phone call data)
const primaryConfig = {
  apiKey: "AIzaSyBhViY_G9JQqE8Q_J9E6pQGLVcCvKPgdpQ",
  authDomain: "help-desk-phone-call-data.firebaseapp.com",
  projectId: "help-desk-phone-call-data",
  storageBucket: "help-desk-phone-call-data.firebasestorage.app",
  messagingSenderId: "984657860321",
  appId: "1:984657860321:web:247ee746c65a9d83d609a0",
  measurementId: "G-M0SKFWJKRV"
};

// Secondary Firestore (bookings data) – replace with real values
const bookingsConfig = {
  apiKey: "AIzaSyDHwDIQIwz7Ow3A9cSmL04LIhPFZ7mMTd4",
  authDomain: "bookings-appointments.firebaseapp.com",
  projectId: "bookings-appointments",
  storageBucket: "bookings-appointments.firebasestorage.app",
  messagingSenderId: "562749151922",
  appId: "1:562749151922:web:8c0a0ec9a530115f07c7ab"
};

// Initialize apps
const primaryApp = getApps().length === 0 ? initializeApp(primaryConfig) : getApp();
const bookingsApp = getApps().find(app => app.name === "bookingsApp")
  || initializeApp(bookingsConfig, "bookingsApp");

// Firestore instances
export const db = getFirestore(primaryApp);           // phone_calls
export const bookingsDb = getFirestore(bookingsApp);  // bookings-appointments