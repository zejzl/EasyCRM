import { Logo } from '@crm/ui'
import { RedirectIfAuthenticated } from '@/components/auth/AuthGuards'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <Logo className="text-white" size="lg" />
        </div>

        <div className="space-y-4 text-white">
          <h1 className="text-4xl font-bold">
            Welcome to EasyCRM
          </h1>
          <p className="text-xl text-blue-100">
            Modern B2B CRM system for managing your business relationships
          </p>

          <div className="space-y-2 pt-8 text-blue-100">
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Manage companies, contacts, and deals</span>
            </div>
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Track activities and communications</span>
            </div>
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Visualize your sales pipeline</span>
            </div>
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Generate insightful analytics</span>
            </div>
          </div>
        </div>

        <div className="text-sm text-blue-200">
          © 2024 EasyCRM. All rights reserved.
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex w-full flex-col justify-center bg-white px-6 py-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo size="md" />
          </div>
          <RedirectIfAuthenticated>{children}</RedirectIfAuthenticated>
        </div>
      </div>
    </div>
  )
}
