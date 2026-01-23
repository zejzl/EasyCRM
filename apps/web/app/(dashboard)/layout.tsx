'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/store/auth.store'
import { useCurrentUser, useLogout } from '@/lib/api/auth.api'
import { Loading } from '@crm/ui'
import { LogOut, User } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { initialize, isLoading, user } = useAuthStore()
  const { data: currentUser } = useCurrentUser()
  const logout = useLogout()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" text="Loading..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple header for now */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-blue-600">EasyCRM</h1>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-700">{user.name}</span>
                  <span className="text-gray-400">({user.role})</span>
                </div>

                <button
                  onClick={() => logout.mutate()}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  )
}
