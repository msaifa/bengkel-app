import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from 'firebase/auth';
import { app, isFirebaseConfigured } from './config';

/**
 * Firebase Auth instance.
 * Will be null when Firebase is not configured.
 */
let auth: Auth | null = null;

if (isFirebaseConfigured && app) {
  auth = getAuth(app);
}

export { auth };

/**
 * Sign in with email and password.
 * Throws if Firebase is not configured.
 */
export async function loginWithEmailAndPassword(
  email: string,
  password: string,
): Promise<UserCredential> {
  if (!auth) {
    throw new Error('Firebase belum dikonfigurasi. Periksa environment variables.');
  }
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign out the current user.
 * Throws if Firebase is not configured.
 */
export async function logout(): Promise<void> {
  if (!auth) {
    throw new Error('Firebase belum dikonfigurasi. Periksa environment variables.');
  }
  return signOut(auth);
}
