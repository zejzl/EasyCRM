'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth.store';
import { useCurrentUser } from '@/lib/api/auth.api';
import { Loading } from '@crm/ui';
import { Sidebar } from '@/components/layouts/Sidebar';
import { Header } from '@/components/layouts/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { initialize, isLoading, isAuthenticated } = useAuthStore();
  const { data: currentUser } = useCurrentUser();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading while initializing auth state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }

  // If not authenticated, this layout shouldn't render (middleware should redirect)
  if (!isAuthenticated) {
    return null;
  }

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
