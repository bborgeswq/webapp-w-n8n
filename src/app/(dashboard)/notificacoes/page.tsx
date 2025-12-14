'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Bell,
  CheckCheck,
  Trash2,
  FileText,
  AlertTriangle,
  Info,
  CheckCircle,
  Calendar,
  Loader2,
  Settings,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  EmptyState,
} from '@/components/ui'
import { Header } from '@/components/layout'
import { cn, formatDate } from '@/lib/utils'

interface Notificacao {
  id: string
  titulo: string
  mensagem: string
  tipo: string
  link: string | null
  lida: boolean
  createdAt: string
  pedidoId: string | null
  prazoId: string | null
}

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)
  const [naoLidas, setNaoLidas] = useState(0)
  const [filtro, setFiltro] = useState<'todas' | 'naoLidas'>('todas')

  useEffect(() => {
    fetchNotificacoes()
  }, [filtro])

  const fetchNotificacoes = async () => {
    try {
      const params = new URLSearchParams()
      if (filtro === 'naoLidas') params.append('naoLidas', 'true')

      const response = await fetch(`/api/notificacoes?${params}`)
      if (response.ok) {
        const data = await response.json()
        setNotificacoes(data.notificacoes)
        setNaoLidas(data.naoLidas)
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  const marcarComoLida = async (id: string) => {
    try {
      await fetch('/api/notificacoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      })
      fetchNotificacoes()
    } catch (error) {
      toast.error('Erro ao atualizar notificação')
    }
  }

  const marcarTodasComoLidas = async () => {
    try {
      await fetch('/api/notificacoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marcarTodas: true }),
      })
      toast.success('Todas as notificações foram marcadas como lidas')
      fetchNotificacoes()
    } catch (error) {
      toast.error('Erro ao atualizar notificações')
    }
  }

  const excluirNotificacao = async (id: string) => {
    try {
      await fetch(`/api/notificacoes?id=${id}`, { method: 'DELETE' })
      toast.success('Notificação excluída')
      fetchNotificacoes()
    } catch (error) {
      toast.error('Erro ao excluir notificação')
    }
  }

  const excluirTodas = async () => {
    if (!confirm('Tem certeza que deseja excluir todas as notificações?')) return

    try {
      await fetch('/api/notificacoes?todas=true', { method: 'DELETE' })
      toast.success('Todas as notificações foram excluídas')
      fetchNotificacoes()
    } catch (error) {
      toast.error('Erro ao excluir notificações')
    }
  }

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'sucesso':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'alerta':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'erro':
        return <AlertTriangle className="w-5 h-5 text-red-400" />
      case 'pedido':
        return <FileText className="w-5 h-5 text-primary-400" />
      case 'prazo':
        return <Calendar className="w-5 h-5 text-orange-400" />
      default:
        return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  return (
    <div className="min-h-screen">
      <Header title="Notificações" />

      <div className="p-6 max-w-4xl mx-auto">
        {/* Header Actions */}
        <Card variant="bordered" className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary-400" />
                  <span className="text-white font-medium">
                    {naoLidas} não lidas
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filtro === 'todas' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFiltro('todas')}
                  >
                    Todas
                  </Button>
                  <Button
                    variant={filtro === 'naoLidas' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFiltro('naoLidas')}
                  >
                    Não Lidas
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                {naoLidas > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={marcarTodasComoLidas}
                    className="gap-2"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Marcar todas como lidas
                  </Button>
                )}
                {notificacoes.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={excluirTodas}
                    className="gap-2 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                    Limpar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : notificacoes.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Nenhuma notificação"
            description={
              filtro === 'naoLidas'
                ? 'Você não tem notificações não lidas.'
                : 'Você ainda não recebeu nenhuma notificação.'
            }
            action={
              filtro === 'naoLidas' ? (
                <Button variant="outline" onClick={() => setFiltro('todas')}>
                  Ver todas
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-3">
            {notificacoes.map((notificacao) => (
              <Card
                key={notificacao.id}
                variant="bordered"
                className={cn(
                  'transition-all',
                  !notificacao.lida && 'border-l-4 border-l-primary-500 bg-primary-500/5'
                )}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5">
                      {getIcon(notificacao.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className={cn(
                            'font-medium',
                            notificacao.lida ? 'text-dark-300' : 'text-white'
                          )}>
                            {notificacao.titulo}
                          </h3>
                          <p className="text-sm text-dark-400 mt-1">
                            {notificacao.mensagem}
                          </p>
                          <p className="text-xs text-dark-500 mt-2">
                            {formatDate(notificacao.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {notificacao.link && (
                            <Link href={notificacao.link}>
                              <Button variant="ghost" size="sm">
                                Ver
                              </Button>
                            </Link>
                          )}
                          {!notificacao.lida && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => marcarComoLida(notificacao.id)}
                              title="Marcar como lida"
                            >
                              <CheckCheck className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => excluirNotificacao(notificacao.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Settings Link */}
        <div className="mt-8 text-center">
          <Link href="/configuracoes">
            <Button variant="ghost" className="gap-2">
              <Settings className="w-4 h-4" />
              Configurar preferências de notificação
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
