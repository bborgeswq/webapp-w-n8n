'use client'

import { ReactNode, ComponentType } from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon | ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-dark-400" />
        </div>
      )}
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-dark-400 max-w-sm mb-4">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
