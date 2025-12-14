'use client'

import { ReactNode, useState } from 'react'
import { Sidebar } from './Sidebar'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-dark-950">
      <Sidebar />
      <main className="ml-16 lg:ml-72 min-h-screen transition-all duration-300">
        {children}
      </main>
    </div>
  )
}
