'use client'

import { useSession } from 'next-auth/react'
import { User } from 'lucide-react'

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  const { data: session } = useSession()

  return (
    <header className="h-16 border-b border-dark-800 bg-dark-900/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        <div>
          {title && <h1 className="text-xl font-semibold text-white">{title}</h1>}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white">
                {session?.user?.name || 'Usuário'}
              </p>
              <p className="text-xs text-dark-400">
                {session?.user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
