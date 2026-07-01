import { initializeApp, getApps } from "firebase/app";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let firebaseStorage = null;
let firebaseAnalytics = null;
let activeConfig = null;

const STORAGE_KEY = "FLIGHT_ERP_FIREBASE_CONFIG";

export function getFirebaseConfigFromEnv() {
  const config = {
    apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyB05bAJSOHC58sqJUWEiZVyKcsaYUk2cys",
    authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "flight-erp-system.firebaseapp.com",
    projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "flight-erp-system",
    storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "flight-erp-system.firebasestorage.app",
    messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "620917251435",
    appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:620917251435:web:ea96a306910d0b1871002e",
    measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || "G-HZ67WGZW9C"
  };
  if (!config.apiKey || !config.projectId) return null;
  return config;
}

export function getStoredFirebaseConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function resolveFirebaseConfig() {
  return getFirebaseConfigFromEnv() || getStoredFirebaseConfig();
}

export function saveFirebaseConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function initFirebase(config = resolveFirebaseConfig()) {
  if (!config?.apiKey || !config?.projectId) {
    console.warn("[AeroERP] Firebase skipped: missing credentials. Running in offline simulator mode.");
    return false;
  }
  try {
    firebaseApp = getApps().length === 0 ? initializeApp(config) : getApps()[0];
    firebaseAuth = getAuth(firebaseApp);
    firebaseDb = getFirestore(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);
    if (typeof window !== "undefined" && config.measurementId) {
      try { firebaseAnalytics = getAnalytics(firebaseApp); } catch (_) { }
    }
    activeConfig = config;
    console.log("[AeroERP] Firebase initialized:", config.projectId);
    return true;
  } catch (err) {
    console.error("[AeroERP] Firebase initialization failed:", err.message);
    firebaseApp = firebaseAuth = firebaseDb = firebaseStorage = firebaseAnalytics = activeConfig = null;
    return false;
  }
}

/**
 * Sends a real Firebase password reset email.
 * Falls back gracefully when Firebase is not connected.
 */
export async function firebaseSendPasswordReset(email) {
  if (!firebaseAuth) {
    throw new Error("Firebase is not initialized. Cannot send reset email.");
  }

  // Firebase default action code settings — customize the URL to your deployed domain
  const actionCodeSettings = {
    url: `${window.location.origin}/login`,
    handleCodeInApp: false
  };

  try {
    await sendPasswordResetEmail(firebaseAuth, email, actionCodeSettings);
    return true;
  } catch (err) {
    // Map Firebase error codes to human-readable messages
    const errorMap = {
      "auth/user-not-found": "No account found with this email address.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
      "auth/network-request-failed": "Network error. Check your internet connection and try again."
    };
    const readable = errorMap[err.code] || err.message;
    throw new Error(readable);
  }
}

export function isFirebaseInitialized() {
  return !!(firebaseAuth && firebaseDb);
}

export function getActiveFirebaseConfig() {
  return activeConfig;
}

// Auto-initialize on import
initFirebase();

export { firebaseApp, firebaseAuth, firebaseDb, firebaseStorage, firebaseAnalytics };
