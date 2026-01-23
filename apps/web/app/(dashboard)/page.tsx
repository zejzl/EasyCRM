'use client';

import { useAuthStore } from '@/lib/store/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Briefcase, Activity, Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const quickActions = [
    {
      title: 'Add Company',
      description: 'Create a new company record',
      href: '/companies',
      icon: Building2,
      color: 'bg-blue-500',
    },
    {
      title: 'Add Contact',
      description: 'Add a new contact person',
      href: '/contacts',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Create Deal',
      description: 'Start a new sales opportunity',
      href: '/deals',
      icon: Briefcase,
      color: 'bg-purple-500',
    },
    {
      title: 'Log Activity',
      description: 'Record a customer interaction',
      href: '/activities',
      icon: Activity,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}!</h1>
          <p className="mt-2 text-muted-foreground">
            Here&apos;s what&apos;s happening with your CRM today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Phase 3: Layout & Navigation Complete
          </span>
        </div>
      </div>

      {/* Quick stats - Placeholder for Phase 5 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Total companies in CRM</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Active contacts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Deals</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">In sales pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Card key={action.title} className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href={action.href}>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-md ${action.color}`}>
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-base">{action.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{action.description}</CardDescription>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Development Status */}
      <Card>
        <CardHeader>
          <CardTitle>Development Progress</CardTitle>
          <CardDescription>Current status of EasyCRM development phases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Phase 1: Backend API - Complete</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Phase 2: Authentication - Complete</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Phase 3: Layout & Navigation - Complete</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span className="text-sm">Phase 4: CRUD Operations - Next</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span className="text-sm">Phase 5: Analytics Dashboard - Coming Soon</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
