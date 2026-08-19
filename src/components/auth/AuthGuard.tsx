'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard — client-side authentication boundary.
 *
 * - While auth state is loading: shows a centered loading spinner.
 * - If user is not authenticated: redirects to /login.
 * - If user is authenticated: renders children.
 *
 * NOTE: This guard is for UX/navigation only.
 * Database security is enforced by Firestore Security Rules.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    // Redirect is in progress; render nothing to avoid flash.
    return null;
  }

  return <>{children}</>;
}
