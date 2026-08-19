'use client';

import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Convenience hook to access authentication state.
 *
 * Returns:
 *   user    — Firebase User or null
 *   loading — true while auth state is being resolved
 *   login   — sign in with email + password
 *   logout  — sign out current user
 */
export function useAuth() {
  return useAuthContext();
}
