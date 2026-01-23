'use client'

import { useAuthStore } from '@/lib/store/auth.store'
import { Building2, Users, Briefcase, Activity } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your CRM today
        </p>
      </div>

      {/* Quick stats - Placeholder */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Companies</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Contacts</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Deals</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <Briefcase className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Activities</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
            </div>
            <div className="rounded-full bg-orange-100 p-3">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Phase 2 Progress
        </h2>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Authentication system implemented</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Login and Register pages created</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>JWT token management with auto-refresh</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Route protection middleware</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-600">⋯</span>
            <span>Next: Core layout & navigation (Phase 3)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">○</span>
            <span>Then: CRUD operations for Companies, Contacts, Deals (Phase 4)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
