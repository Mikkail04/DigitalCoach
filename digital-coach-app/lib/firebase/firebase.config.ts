/**
 * Frontend's Connection to Firebase Services
 */
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { initializeApp, getApps } from "firebase/app";

// Setup Firebase configurations to allow Firebase Client SDK to connect to our backend
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app but check if it's already initialized 
// if (getApps().length === 0) {
//   var app = initializeApp(firebaseConfig)
// }
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app) // Firebase Authentication
const db = getFirestore(app); // Firebase Firestore
const storage = getStorage(app); // Firebase Storage

// Analytics (client-side only)
if (typeof window !== "undefined" && "measurementId" in firebaseConfig) {
  getAnalytics(app);
}
// Connect emulators for development only. NODE_ENV will be 'development' automatically due to docker-compose.yml setting 
// Check emulator flag set by next.config.js which is based on NODE_ENV 
const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "false"; 
if (useEmulator) {
  // Determine host (browser or Docker) if we're in the browser (window exists), use localhost and if we're in a Docker container, use the service name 'firebase'.
  const emulatorHost = typeof window !== "undefined" ? "localhost" : "firebase";

  // If we're in the browser, use localhost for auth emulator. If in Docker, use 'firebase' service name.
  const authURL = typeof window !== "undefined" ? "http://localhost:9099" : "http://firebase:9099";

  console.log(`Connecting to Firebase Emulators on ${emulatorHost}`)

  connectAuthEmulator(auth, authURL, {disableWarnings: true});
  connectFirestoreEmulator(db, emulatorHost, 8080)
  connectStorageEmulator(storage, emulatorHost, 9199)

} else {
  console.log("Using production Firebase services.");
}

// Export instances of Firebase services for use throughout the app
export { app, auth, db, storage }