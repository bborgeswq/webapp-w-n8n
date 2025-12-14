'use client'

import { cn } from '@/lib/utils'

interface ToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Toggle({
  enabled,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
}: ToggleProps) {
  const sizes = {
    sm: { toggle: 'w-8 h-5', dot: 'w-3 h-3', translate: 'translate-x-3.5' },
    md: { toggle: 'w-11 h-6', dot: 'w-4 h-4', translate: 'translate-x-5' },
    lg: { toggle: 'w-14 h-7', dot: 'w-5 h-5', translate: 'translate-x-7' },
  }

  const currentSize = sizes[size]

  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <span className="text-sm font-medium text-white">{label}</span>
          )}
          {description && (
            <p className="text-xs text-dark-400 mt-0.5">{description}</p>
          )}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => !disabled && onChange(!enabled)}
        className={cn(
          'relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900',
          currentSize.toggle,
          enabled ? 'bg-primary-600' : 'bg-dark-600',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            currentSize.dot,
            enabled ? currentSize.translate : 'translate-x-0.5',
            'mt-0.5 ml-0.5'
          )}
        />
      </button>
    </div>
  )
}
