'use client'

import { ReactNode, useState } from 'react'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  icon?: ReactNode
  content: ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  onChange?: (tabId: string) => void
  variant?: 'default' | 'pills' | 'underline'
}

export function Tabs({ tabs, defaultTab, onChange, variant = 'default' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
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
      <div className={cn('flex gap-1', currentVariant.list)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2',
              currentVariant.tab,
              activeTab === tab.id ? currentVariant.activeTab : currentVariant.inactiveTab
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  )
}
