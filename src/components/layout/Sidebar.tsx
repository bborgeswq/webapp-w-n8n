'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Plus,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Scale,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { cn, formatDate, truncateText } from '@/lib/utils'
import { Button } from '@/components/ui'

interface Pedido {
  id: string
  titulo: string
  tipoPeca: string
  status: string
  createdAt: string
  confirmado: boolean
}

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPedidos()
  }, [])

  const fetchPedidos = async () => {
    try {
      const response = await fetch('/api/pedidos')
      if (response.ok) {
        const data = await response.json()
        setPedidos(data)
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string, confirmado: boolean) => {
    if (confirmado) return <CheckCircle className="w-4 h-4 text-green-400" />
    switch (status) {
      case 'pendente':
        return <Clock className="w-4 h-4 text-yellow-400" />
      case 'processando':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
      case 'concluido':
        return <FileText className="w-4 h-4 text-primary-400" />
      case 'erro':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return <FileText className="w-4 h-4 text-dark-400" />
    }
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-dark-900 border-r border-dark-800 transition-all duration-300 z-40 flex flex-col',
        isCollapsed ? 'w-16' : 'w-72'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-dark-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/novo-pedido" className="flex items-center gap-2">
              <Scale className="w-8 h-8 text-primary-500" />
              <span className="text-xl font-bold text-white">JurisAI</span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-white transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Novo Pedido Button */}
      <div className="p-3">
        <Link href="/novo-pedido">
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start gap-2',
              isCollapsed && 'justify-center px-2'
            )}
          >
            <Plus className="w-5 h-5" />
            {!isCollapsed && <span>Novo Pedido</span>}
          </Button>
        </Link>
      </div>

      {/* Pedidos List */}
      <div className="flex-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
              Pedidos Recentes
            </h3>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-dark-400" />
          </div>
        ) : pedidos.length === 0 ? (
          !isCollapsed && (
            <div className="px-3 py-4 text-center">
              <p className="text-sm text-dark-500">
                Nenhum pedido ainda
              </p>
            </div>
          )
        ) : (
          <nav className="space-y-1 px-2">
            {pedidos.map((pedido) => {
              const isActive = pathname === `/pedidos/${pedido.id}`
              return (
                <Link
                  key={pedido.id}
                  href={`/pedidos/${pedido.id}`}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group',
                    isActive
                      ? 'bg-dark-800 text-white'
                      : 'text-dark-300 hover:bg-dark-800/50 hover:text-white'
                  )}
                >
                  {getStatusIcon(pedido.status, pedido.confirmado)}
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {truncateText(pedido.titulo, 25)}
                      </p>
                      <p className="text-xs text-dark-500">
                        {formatDate(pedido.createdAt)}
                      </p>
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-dark-800 space-y-1">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-dark-300 hover:bg-dark-800 hover:text-white transition-colors',
            isCollapsed && 'justify-center'
          )}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  )
}
