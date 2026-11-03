'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterInput } from '@crm/types'
import { useRegister } from '@/lib/api/auth.api'
import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth.store'
import { useInvite, useRegistrationMode } from '@/lib/api/registration.api'
import { Loader2 } from 'lucide-react'

// Invite-only by default (F02): an invite link (?invite=...) shows the invite form; without one, the open sign-up form
// appears only when the API reports REGISTRATION_MODE=open.
export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterRouter />
    </Suspense>
  )
}

function RegisterRouter() {
  const invite = useSearchParams().get('invite')
  const mode = useRegistrationMode()
  if (invite) return <InviteSignup token={invite} />
  if (mode.isLoading) return null
  if (mode.data === 'open') return <OpenSignup />
  return <InviteOnlyNotice />
}

function InviteOnlyNotice() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Invite only</h1>
        <p className="text-gray-600">
          Accounts are created by invitation. Ask your administrator for an invite link.
        </p>
      </div>
      <div className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
          Sign in
        </Link>
      </div>
    </div>
  )
}

function InviteSignup({ token }: { token: string }) {
  const invite = useInvite(token)
  const acceptInvite = useAuthStore((s) => s.acceptInvite)
  const [name, setName] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (invite.isLoading) return null
  if (invite.isError || !invite.data) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Invite not valid</h1>
        <p className="text-gray-600">This invite link is invalid or has expired. Ask your administrator for a new one.</p>
        <Link href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
          Back to sign in
        </Link>
      </div>
    )
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await acceptInvite({ invite: token, password, name: (name ?? invite.data.name).trim() || undefined })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not create the account. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const input =
    'block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500'
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Accept your invite</h1>
        <p className="text-gray-600">Set a password for {invite.data.email}</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full name
          </label>
          <input id="name" type="text" autoComplete="name" className={input} value={name ?? invite.data.name}
            onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input id="password" type="password" autoComplete="new-password" className={input} value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
        </div>
        <button type="submit" disabled={busy}
          className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Create account
        </button>
      </form>
    </div>
  )
}

function OpenSignup() {
  const register = useRegister()
  const [error, setError] = useState<string | null>(null)

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    try {
      setError(null)
      await register.mutateAsync(data)
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Registration failed. Please try again.'
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Create your account
        </h1>
        <p className="text-gray-600">
          Get started with EasyCRM today
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Full name
          </label>
          <input
            {...registerField('name')}
            id="name"
            type="text"
            autoComplete="name"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <input
            {...registerField('email')}
            id="email"
            type="email"
            autoComplete="email"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="you@company.com"
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            {...registerField('password')}
            id="password"
            type="password"
            autoComplete="new-password"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="At least 6 characters"
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
          <p className="text-xs text-gray-500">
            Password must be at least 6 characters long
          </p>
        </div>

        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
            I agree to the{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </a>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || register.isPending}
          className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting || register.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      <div className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}
