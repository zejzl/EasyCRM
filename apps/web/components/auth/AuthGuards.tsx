'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loading } from '@crm/ui';
import { useAuthStore } from '@/lib/store/auth.store';
import { safeNextPath } from '@/lib/auth/nextPath';

// Route guards. Tokens live in localStorage (the persisted auth store), which server middleware cannot read, so the
// guards run in the browser after the store has rehydrated. Before that they show a spinner, never the page.


function useReady(): boolean {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && hasHydrated;
}

function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loading size="lg" text="Loading..." />
    </div>
  );
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const ready = useReady();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace(`/login?from=${encodeURIComponent(pathname || '/')}`);
    }
  }, [ready, isAuthenticated, router, pathname]);

  if (!ready || !isAuthenticated) return <Spinner />;
  return <>{children}</>;
}

export function RedirectIfAuthenticated({ children }: { children: React.ReactNode }) {
  const ready = useReady();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (ready && isAuthenticated) {
      const from = new URLSearchParams(window.location.search).get('from');
      router.replace(safeNextPath(from));
    }
  }, [ready, isAuthenticated, router]);

  if (ready && isAuthenticated) return <Spinner />;
  return <>{children}</>;
}
