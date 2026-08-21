'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function UangKeluarRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function redirect() {
      const tambah = searchParams.get('tambah');
      router.replace(tambah === '1' ? '/keuangan?tambah=1' : '/keuangan');
    }
    redirect();
  }, [router, searchParams]);

  return null;
}
