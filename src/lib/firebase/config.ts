import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

// ─── Decode Base64-encoded Firebase config from single env variable ───────────
const encodedConfig = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let firebaseConfig: Record<string, any> = {};

if (encodedConfig) {
  try {
    // Buffer.from works in both Node.js (SSR) and Edge/browser environments
    // because Next.js polyfills Buffer on the client side.
    const decodedString = Buffer.from(encodedConfig, 'base64').toString('utf8');
    firebaseConfig = JSON.parse(decodedString);
  } catch (error) {
    console.error('[Firebase] Gagal melakukan parse Firebase Config dari Base64:', error);
  }
} else {
  console.error('[Firebase] NEXT_PUBLIC_FIREBASE_CONFIG tidak ditemukan di .env');
}

/**
 * Returns true when all required Firebase fields are present after decoding.
 */
export const isFirebaseConfigured: boolean = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.databaseURL &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId,
);

/**
 * Singleton Firebase App instance.
 * Uses getApps() to avoid duplicate initialization on hot reload.
 */
let app: FirebaseApp | null = null;

if (isFirebaseConfigured) {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

export { app };
