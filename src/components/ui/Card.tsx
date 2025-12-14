'use client'

import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered'
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-6',
        variant === 'default' && 'bg-dark-800',
        variant === 'bordered' && 'bg-dark-800 border border-dark-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-semibold text-white', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-dark-400 mt-1', className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-4 flex items-center gap-3', className)} {...props}>
      {children}
    </div>
  )
}
