'use client'

import { ReactNode, useState, ComponentType } from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface Tab {
  id: string
  label: string
  icon?: LucideIcon | ComponentType<{ className?: string }>
  content?: ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  activeTab?: string
  onChange?: (tabId: string) => void
  variant?: 'default' | 'pills' | 'underline'
}

export function Tabs({ tabs, defaultTab, activeTab: controlledActiveTab, onChange, variant = 'default' }: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0]?.id)

  // Use controlled value if provided, otherwise use internal state
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab

  const handleTabClick = (tabId: string) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId)
    }
    onChange?.(tabId)
  }

  const variants = {
    default: {
      list: 'border-b border-dark-700',
      tab: 'border-b-2 -mb-px',
      activeTab: 'border-primary-500 text-primary-400',
      inactiveTab: 'border-transparent text-dark-400 hover:text-white hover:border-dark-500',
    },
    pills: {
      list: 'bg-dark-800 p-1 rounded-lg',
      tab: 'rounded-md',
      activeTab: 'bg-dark-700 text-white',
      inactiveTab: 'text-dark-400 hover:text-white',
    },
    underline: {
      list: '',
      tab: '',
      activeTab: 'text-primary-400 underline underline-offset-8 decoration-2',
      inactiveTab: 'text-dark-400 hover:text-white',
    },
  }

  const currentVariant = variants[variant]

  return (
    <div>
      {/* Tab List */}
      <div className={cn('flex gap-1 overflow-x-auto', currentVariant.list)}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap',
                currentVariant.tab,
                activeTab === tab.id ? currentVariant.activeTab : currentVariant.inactiveTab
              )}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content - only render if tabs have content */}
      {tabs.some(tab => tab.content) && (
        <div className="mt-4">
          {tabs.find((tab) => tab.id === activeTab)?.content}
        </div>
      )}
    </div>
  )
}
