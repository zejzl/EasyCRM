'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth.store';
import { useCurrentUser } from '@/lib/api/auth.api';
import { Sidebar } from '@/components/layouts/Sidebar';
import { Header } from '@/components/layouts/Header';
import { RequireAuth } from '@/components/auth/AuthGuards';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <DashboardShell>{children}</DashboardShell>
    </RequireAuth>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);
  useCurrentUser();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
