'use client'

import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-dark-700 text-dark-200',
    success: 'bg-green-900/50 text-green-400 border border-green-800',
    warning: 'bg-yellow-900/50 text-yellow-400 border border-yellow-800',
    danger: 'bg-red-900/50 text-red-400 border border-red-800',
    info: 'bg-blue-900/50 text-blue-400 border border-blue-800',
    outline: 'bg-transparent border border-dark-600 text-dark-300',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
