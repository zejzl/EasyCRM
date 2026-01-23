'use client'

import React, { Component, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <h2 className="text-xl font-semibold">Something went wrong</h2>
            </div>
            <p className="mt-4 text-gray-600">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              className="mt-6 w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              onClick={() => this.setState({ hasError: false, error: undefined })}
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
