'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileText,
  Clock,
  CheckCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  BarChart3,
  Calendar,
  FolderOpen,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui'
import { Header } from '@/components/layout'
import { cn, formatDate } from '@/lib/utils'
import { TIPOS_PECA } from '@/types'

interface DashboardStats {
  estatisticas: {
    totalPedidos: number
    pedidosPendentes: number
    pedidosEmProcessamento: number
    pedidosConcluidos: number
    pedidosUltimos30Dias: number
    pedidosSemana: number
    pedidosMes: number
    totalDocumentos: number
    tendencia: number
  }
  pedidosPorTipo: Array<{ tipo: string; quantidade: number }>
  pedidosRecentes: Array<{
    id: string
    titulo: string
    tipoPeca: string
    status: string
    createdAt: string
    nomeCliente: string | null
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="warning">Pendente</Badge>
      case 'processando':
        return <Badge variant="info">Processando</Badge>
      case 'concluido':
        return <Badge variant="success">Concluído</Badge>
      case 'erro':
        return <Badge variant="danger">Erro</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTipoPecaLabel = (value: string) => {
    return TIPOS_PECA.find(t => t.value === value)?.label || value
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Dashboard" />
        <div className="p-6 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </div>
    )
  }

  const { estatisticas, pedidosPorTipo, pedidosRecentes } = stats || {
    estatisticas: {
      totalPedidos: 0,
      pedidosPendentes: 0,
      pedidosEmProcessamento: 0,
      pedidosConcluidos: 0,
      pedidosUltimos30Dias: 0,
      pedidosSemana: 0,
      pedidosMes: 0,
      totalDocumentos: 0,
      tendencia: 0,
    },
    pedidosPorTipo: [],
    pedidosRecentes: [],
  }

  return (
    <div className="min-h-screen">
      <Header title="Dashboard" />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Pedidos */}
          <Card className="bg-gradient-to-br from-primary-900/50 to-dark-800">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-dark-400">Total de Pedidos</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {estatisticas.totalPedidos}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {estatisticas.tendencia >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className={cn(
                  'text-sm',
                  estatisticas.tendencia >= 0 ? 'text-green-400' : 'text-red-400'
                )}>
                  {estatisticas.tendencia >= 0 ? '+' : ''}{estatisticas.tendencia}%
                </span>
                <span className="text-sm text-dark-500">vs. mês anterior</span>
              </div>
            </CardContent>
          </Card>

          {/* Pendentes */}
          <Card variant="bordered">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-dark-400">Pendentes</p>
                  <p className="text-3xl font-bold text-yellow-400 mt-1">
                    {estatisticas.pedidosPendentes}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-yellow-600/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
              <p className="mt-4 text-sm text-dark-500">
                Aguardando processamento
              </p>
            </CardContent>
          </Card>

          {/* Em Processamento */}
          <Card variant="bordered">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-dark-400">Em Processamento</p>
                  <p className="text-3xl font-bold text-blue-400 mt-1">
                    {estatisticas.pedidosEmProcessamento}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                </div>
              </div>
              <p className="mt-4 text-sm text-dark-500">
                IA gerando documentos
              </p>
            </CardContent>
          </Card>

          {/* Concluídos */}
          <Card variant="bordered">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-dark-400">Concluídos</p>
                  <p className="text-3xl font-bold text-green-400 mt-1">
                    {estatisticas.pedidosConcluidos}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <p className="mt-4 text-sm text-dark-500">
                Documentos prontos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pedidos Recentes */}
          <Card variant="bordered" className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pedidos Recentes</CardTitle>
              <Link href="/novo-pedido">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Pedido
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {pedidosRecentes.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                  <p className="text-dark-400">Nenhum pedido ainda</p>
                  <Link href="/novo-pedido">
                    <Button variant="outline" size="sm" className="mt-4">
                      Criar primeiro pedido
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {pedidosRecentes.map((pedido) => (
                    <Link
                      key={pedido.id}
                      href={`/pedidos/${pedido.id}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50 hover:bg-dark-800 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white group-hover:text-primary-400 transition-colors">
                            {pedido.titulo}
                          </p>
                          <p className="text-sm text-dark-400">
                            {pedido.nomeCliente ? `${pedido.nomeCliente} • ` : ''}
                            {formatDate(pedido.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(pedido.status)}
                        <ArrowRight className="w-4 h-4 text-dark-500 group-hover:text-white transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estatísticas por Tipo */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-400" />
                Por Tipo de Peça
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pedidosPorTipo.length === 0 ? (
                <p className="text-center text-dark-500 py-4">
                  Sem dados ainda
                </p>
              ) : (
                <div className="space-y-4">
                  {pedidosPorTipo.map((item, index) => {
                    const maxCount = pedidosPorTipo[0]?.quantidade || 1
                    const percentage = (item.quantidade / maxCount) * 100
                    return (
                      <div key={item.tipo}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-dark-300">
                            {getTipoPecaLabel(item.tipo)}
                          </span>
                          <span className="text-sm font-medium text-white">
                            {item.quantidade}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-dark-700 overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500',
                              index === 0 ? 'bg-primary-500' :
                              index === 1 ? 'bg-blue-500' :
                              index === 2 ? 'bg-green-500' :
                              index === 3 ? 'bg-yellow-500' :
                              'bg-purple-500'
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="bordered">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{estatisticas.pedidosSemana}</p>
                  <p className="text-sm text-dark-400">Pedidos esta semana</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{estatisticas.pedidosMes}</p>
                  <p className="text-sm text-dark-400">Pedidos este mês</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{estatisticas.totalDocumentos}</p>
                  <p className="text-sm text-dark-400">Documentos enviados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
