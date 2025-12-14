'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
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
  LayoutDashboard,
  BookOpen,
  CalendarClock,
  User,
  Bell,
  Star,
  FolderOpen,
} from 'lucide-react'
import { cn, formatDate, truncateText } from '@/lib/utils'
import { Button, Avatar } from '@/components/ui'

interface Pedido {
  id: string
  titulo: string
  tipoPeca: string
  status: string
  createdAt: string
  confirmado: boolean
}

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/novo-pedido', icon: Plus, label: 'Novo Pedido', highlight: true },
  { href: '/teses', icon: BookOpen, label: 'Biblioteca de Teses' },
  { href: '/prazos', icon: CalendarClock, label: 'Prazos' },
]

const BOTTOM_NAV = [
  { href: '/perfil', icon: User, label: 'Meu Perfil' },
  { href: '/configuracoes', icon: Settings, label: 'Configurações' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [notificacoes, setNotificacoes] = useState(0)

  useEffect(() => {
    fetchPedidos()
    fetchNotificacoes()
  }, [])

  const fetchPedidos = async () => {
    try {
      const response = await fetch('/api/pedidos?limite=10')
      if (response.ok) {
        const data = await response.json()
        setPedidos(data.pedidos || data)
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotificacoes = async () => {
    try {
      const response = await fetch('/api/notificacoes?naoLidas=true')
      if (response.ok) {
        const data = await response.json()
        setNotificacoes(data.total || 0)
      }
    } catch (error) {
      // Silently fail - notifications are not critical
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
            <Link href="/dashboard" className="flex items-center gap-2">
              <Scale className="w-8 h-8 text-primary-500" />
              <span className="text-xl font-bold text-white">JurisAI</span>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/dashboard" className="mx-auto">
              <Scale className="w-8 h-8 text-primary-500" />
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              'p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-white transition-colors',
              isCollapsed && 'mx-auto mt-2'
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-600 text-white'
                  : item.highlight
                  ? 'bg-dark-800 text-white hover:bg-primary-600/80'
                  : 'text-dark-300 hover:bg-dark-800 hover:text-white',
                isCollapsed && 'justify-center px-2'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="px-3 py-2">
        <div className="h-px bg-dark-800" />
      </div>

      {/* Pedidos List */}
      <div className="flex-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-3 py-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
              Pedidos Recentes
            </h3>
            <Link
              href="/pedidos"
              className="text-xs text-primary-400 hover:text-primary-300"
            >
              Ver todos
            </Link>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-dark-400" />
          </div>
        ) : pedidos.length === 0 ? (
          !isCollapsed && (
            <div className="px-3 py-4 text-center">
              <FolderOpen className="w-8 h-8 text-dark-600 mx-auto mb-2" />
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

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-dark-800 space-y-1">
        {/* Notificações */}
        <Link
          href="/notificacoes"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-dark-300 hover:bg-dark-800 hover:text-white transition-colors relative',
            isCollapsed && 'justify-center px-2'
          )}
        >
          <Bell className="w-5 h-5" />
          {!isCollapsed && <span>Notificações</span>}
          {notificacoes > 0 && (
            <span className={cn(
              'absolute bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center',
              isCollapsed ? 'top-1 right-1' : 'top-2 right-2'
            )}>
              {notificacoes > 9 ? '9+' : notificacoes}
            </span>
          )}
        </Link>

        {BOTTOM_NAV.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-dark-800 text-white'
                  : 'text-dark-300 hover:bg-dark-800 hover:text-white',
                isCollapsed && 'justify-center px-2'
              )}
            >
              <Icon className="w-5 h-5" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}

        {/* User Profile */}
        {!isCollapsed && session?.user && (
          <div className="pt-2 mt-2 border-t border-dark-800">
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar
                name={session.user.name || 'User'}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-dark-500 truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-dark-300 hover:bg-red-900/20 hover:text-red-400 transition-colors',
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
