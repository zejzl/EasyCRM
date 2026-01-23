import React from 'react'
import { Building2 } from 'lucide-react'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Building2 className={`${sizeClasses[size]} text-blue-600`} />
      <span className="font-bold text-gray-900">EasyCRM</span>
    </div>
  )
}
