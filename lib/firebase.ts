import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Lazily initialize Firebase app (singleton via Firebase SDK)
let _missingKeyWarned = false;
function getFirebaseApp() {
    if (typeof window === "undefined") return undefined;
    if (!firebaseConfig.apiKey) {
        if (!_missingKeyWarned) {
            _missingKeyWarned = true;
            console.warn(
                "Firebase: NEXT_PUBLIC_FIREBASE_API_KEY is not set. " +
                "Auth will not work. Add your Firebase environment variables to .env.local (for local dev) " +
                "or to your Vercel project settings (for deployment)."
            );
        }
        return undefined;
    }
    return !getApps().length ? initializeApp(firebaseConfig) : getApp();
}

// Lazy getters — safe to call multiple times, Firebase SDK caches internally
export function getFirebaseAuth() {
    const app = getFirebaseApp();
    return app ? getAuth(app) : undefined;
}

export function getFirebaseDb() {
    const app = getFirebaseApp();
    return app ? getFirestore(app) : undefined;
}

// Initialize analytics on the client
if (typeof window !== "undefined") {
    const app = getFirebaseApp();
    if (app) {
        isSupported().then((supported) => {
            if (supported) getAnalytics(app);
        });
    }
}
