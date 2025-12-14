'use client'

import { cn } from '@/lib/utils'
import { CORES_DISPONIVEIS } from '@/types'
import { Check } from 'lucide-react'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  colors?: string[]
  label?: string
}

export function ColorPicker({
  value,
  onChange,
  colors = CORES_DISPONIVEIS,
  label,
}: ColorPickerProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-dark-200 mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110',
              value === color && 'ring-2 ring-white ring-offset-2 ring-offset-dark-900'
            )}
            style={{ backgroundColor: color }}
          >
            {value === color && <Check className="w-4 h-4 text-white" />}
          </button>
        ))}
      </div>
    </div>
  )
}
