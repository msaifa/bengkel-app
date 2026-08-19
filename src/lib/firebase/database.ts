import { getDatabase, Database } from 'firebase/database';
import { app, isFirebaseConfigured } from './config';

/**
 * Firebase Realtime Database client instance.
 * Will be null when Firebase is not configured.
 *
 * Import this instance in repositories to interact with RTDB.
 * Do NOT use firebase-admin or server-side SDK for standard CRUD.
 */
let db: Database | null = null;

if (isFirebaseConfigured && app) {
  db = getDatabase(app);
}

export { db };
