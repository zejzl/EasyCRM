export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-900">
          Welcome to <span className="text-blue-600">EasyCRM</span>
        </h1>
        <p className="mb-8 text-xl text-gray-600">
          Modern B2B CRM System - Phase 2 Frontend Development
        </p>
        <div className="mb-8 text-sm text-gray-500">
          <p>✅ Next.js 14 with App Router</p>
          <p>✅ TypeScript & Tailwind CSS</p>
          <p>✅ TanStack Query & Zustand</p>
          <p>✅ Monorepo with Turborepo</p>
        </div>
        <p className="text-gray-400">
          Phase 1 Complete - Scaffolding in progress...
        </p>
      </div>
    </div>
  )
}
