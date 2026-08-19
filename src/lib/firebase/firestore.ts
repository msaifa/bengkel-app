import { getFirestore, Firestore } from 'firebase/firestore';
import { app, isFirebaseConfigured } from './config';

/**
 * Cloud Firestore client instance.
 * Will be null when Firebase is not configured.
 *
 * Import this instance in repositories to interact with Firestore.
 * Do NOT use firebase-admin or server-side SDK for standard CRUD.
 */
let db: Firestore | null = null;

if (isFirebaseConfigured && app) {
  db = getFirestore(app);
}

export { db };
