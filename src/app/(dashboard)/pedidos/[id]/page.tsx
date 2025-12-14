'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  FileText,
  Download,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Copy,
  Trash2,
  RefreshCw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import { Button, Badge, Card, CardContent } from '@/components/ui'
import { Header } from '@/components/layout'
import { ChatMessage, ChatInput } from '@/components/chat'
import { formatDateTime, formatFileSize } from '@/lib/utils'
import { TIPOS_PECA, STATUS_PEDIDO } from '@/types'

interface Documento {
  id: string
  nome: string
  tipo: string
  tamanho: number
  caminho: string
}

interface Mensagem {
  id: string
  conteudo: string
  remetente: 'usuario' | 'sistema'
  createdAt: string
}

interface Pedido {
  id: string
  numero: number
  titulo: string
  tipoPeca: string
  processoNumero: string | null
  vara: string | null
  parteAutora: string | null
  parteRe: string | null
  observacoes: string | null
  status: string
  pecaGerada: string | null
  confirmado: boolean
  confirmadoEm: string | null
  createdAt: string
  updatedAt: string
  documentos: Documento[]
  mensagens: Mensagem[]
}

export default function PedidoPage() {
  const params = useParams()
  const router = useRouter()
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchPedido = async () => {
    try {
      const response = await fetch(`/api/pedidos/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPedido(data)
      } else {
        toast.error('Pedido não encontrado')
        router.push('/novo-pedido')
      }
    } catch (error) {
      console.error('Erro ao carregar pedido:', error)
      toast.error('Erro ao carregar pedido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPedido()
    // Polling para atualizar status enquanto processa
    const interval = setInterval(() => {
      if (pedido?.status === 'processando') {
        fetchPedido()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [params.id, pedido?.status])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [pedido?.mensagens])

  const handleSendMessage = async (message: string) => {
    if (!pedido) return

    setSending(true)
    try {
      const response = await fetch(`/api/pedidos/${pedido.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conteudo: message }),
      })

      if (response.ok) {
        // Recarregar pedido para obter nova mensagem
        await fetchPedido()
        toast.success('Mensagem enviada! Aguarde a resposta.')
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao enviar mensagem')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar mensagem')
    } finally {
      setSending(false)
    }
  }

  const handleConfirm = async () => {
    if (!pedido) return

    setConfirming(true)
    try {
      const response = await fetch(`/api/pedidos/${pedido.id}/confirm`, {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Pedido confirmado!')
        await fetchPedido()
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao confirmar')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao confirmar pedido')
    } finally {
      setConfirming(false)
    }
  }

  const handleCopyPeca = () => {
    if (pedido?.pecaGerada) {
      navigator.clipboard.writeText(pedido.pecaGerada)
      toast.success('Peça copiada para a área de transferência!')
    }
  }

  const handleDownload = () => {
    if (!pedido?.pecaGerada) return

    const blob = new Blob([pedido.pecaGerada], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${pedido.titulo.replace(/[^a-z0-9]/gi, '_')}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Download iniciado!')
  }

  const handleDelete = async () => {
    if (!pedido || !confirm('Tem certeza que deseja excluir este pedido?')) return

    try {
      const response = await fetch(`/api/pedidos/${pedido.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Pedido excluído!')
        router.push('/novo-pedido')
      } else {
        throw new Error('Erro ao excluir')
      }
    } catch (error) {
      toast.error('Erro ao excluir pedido')
    }
  }

  const getStatusBadge = (status: string, confirmado: boolean) => {
    if (confirmado) {
      return <Badge variant="success">Finalizado</Badge>
    }

    const statusInfo = STATUS_PEDIDO.find((s) => s.value === status)
    const variants: Record<string, 'default' | 'warning' | 'info' | 'success' | 'danger'> = {
      pendente: 'warning',
      processando: 'info',
      concluido: 'success',
      erro: 'danger',
    }

    return (
      <Badge variant={variants[status] || 'default'}>
        {statusInfo?.label || status}
      </Badge>
    )
  }

  const getTipoPecaLabel = (tipo: string) => {
    return TIPOS_PECA.find((t) => t.value === tipo)?.label || tipo
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!pedido) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header title={pedido.titulo} />

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar com informações do pedido */}
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-dark-800 bg-dark-900/50 p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/novo-pedido')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Novo Pedido
          </Button>

          {/* Status */}
          <div>
            <p className="text-xs text-dark-500 uppercase tracking-wider mb-2">
              Status
            </p>
            <div className="flex items-center gap-2">
              {pedido.status === 'processando' && (
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              )}
              {getStatusBadge(pedido.status, pedido.confirmado)}
            </div>
          </div>

          {/* Tipo de Peça */}
          <div>
            <p className="text-xs text-dark-500 uppercase tracking-wider mb-2">
              Tipo de Peça
            </p>
            <p className="text-white">{getTipoPecaLabel(pedido.tipoPeca)}</p>
          </div>

          {/* Informações do Processo */}
          {(pedido.processoNumero || pedido.vara) && (
            <div>
              <p className="text-xs text-dark-500 uppercase tracking-wider mb-2">
                Processo
              </p>
              {pedido.processoNumero && (
                <p className="text-dark-300 text-sm">{pedido.processoNumero}</p>
              )}
              {pedido.vara && (
                <p className="text-dark-400 text-sm">{pedido.vara}</p>
              )}
            </div>
          )}

          {/* Partes */}
          {(pedido.parteAutora || pedido.parteRe) && (
            <div>
              <p className="text-xs text-dark-500 uppercase tracking-wider mb-2">
                Partes
              </p>
              {pedido.parteAutora && (
                <p className="text-dark-300 text-sm">
                  <span className="text-dark-500">Autor:</span> {pedido.parteAutora}
                </p>
              )}
              {pedido.parteRe && (
                <p className="text-dark-300 text-sm">
                  <span className="text-dark-500">Réu:</span> {pedido.parteRe}
                </p>
              )}
            </div>
          )}

          {/* Data */}
          <div>
            <p className="text-xs text-dark-500 uppercase tracking-wider mb-2">
              Criado em
            </p>
            <p className="text-dark-300 text-sm">
              {formatDateTime(pedido.createdAt)}
            </p>
          </div>

          {/* Documentos */}
          {pedido.documentos.length > 0 && (
            <div>
              <p className="text-xs text-dark-500 uppercase tracking-wider mb-2">
                Documentos ({pedido.documentos.length})
              </p>
              <div className="space-y-2">
                {pedido.documentos.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.caminho}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-dark-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-dark-200 truncate">
                        {doc.nome}
                      </p>
                      <p className="text-xs text-dark-500">
                        {formatFileSize(doc.tamanho)}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-4 border-t border-dark-800">
            {pedido.status === 'concluido' && pedido.pecaGerada && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={handleCopyPeca}
                >
                  <Copy className="w-4 h-4" />
                  Copiar Peça
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={fetchPedido}
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
              Excluir Pedido
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Status messages */}
          {pedido.status === 'pendente' && (
            <div className="p-4 bg-yellow-900/20 border-b border-yellow-800/50">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-400" />
                <p className="text-yellow-200">
                  Pedido aguardando processamento...
                </p>
              </div>
            </div>
          )}

          {pedido.status === 'processando' && (
            <div className="p-4 bg-blue-900/20 border-b border-blue-800/50">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                <p className="text-blue-200">
                  Processando pedido... Isso pode levar alguns minutos.
                </p>
              </div>
            </div>
          )}

          {pedido.status === 'erro' && (
            <div className="p-4 bg-red-900/20 border-b border-red-800/50">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-200">
                  Ocorreu um erro ao processar o pedido. Tente novamente.
                </p>
              </div>
            </div>
          )}

          {/* Peça Gerada */}
          {pedido.status === 'concluido' && pedido.pecaGerada && (
            <div className="flex-1 overflow-y-auto">
              {/* Confirm banner */}
              {!pedido.confirmado && (
                <div className="sticky top-0 z-10 p-4 bg-primary-900/50 border-b border-primary-800/50">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary-400" />
                      <p className="text-primary-200">
                        Revise a peça gerada. Se estiver satisfeito, confirme o pedido.
                      </p>
                    </div>
                    <Button
                      onClick={handleConfirm}
                      loading={confirming}
                      className="gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Confirmar Peça
                    </Button>
                  </div>
                </div>
              )}

              {/* Peça content */}
              <div className="p-6">
                <Card variant="bordered" className="bg-dark-900">
                  <CardContent className="prose prose-invert max-w-none">
                    <ReactMarkdown>{pedido.pecaGerada}</ReactMarkdown>
                  </CardContent>
                </Card>
              </div>

              {/* Chat para ajustes */}
              {!pedido.confirmado && (
                <div className="border-t border-dark-800">
                  <div className="p-4 bg-dark-900/50">
                    <h3 className="text-sm font-medium text-dark-300 mb-2">
                      Precisa de ajustes? Envie uma mensagem:
                    </h3>
                  </div>

                  {/* Mensagens */}
                  {pedido.mensagens.length > 0 && (
                    <div className="max-h-64 overflow-y-auto">
                      {pedido.mensagens.map((msg) => (
                        <ChatMessage
                          key={msg.id}
                          conteudo={msg.conteudo}
                          remetente={msg.remetente as 'usuario' | 'sistema'}
                          createdAt={msg.createdAt}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}

                  <ChatInput
                    onSend={handleSendMessage}
                    disabled={sending}
                    placeholder="Descreva os ajustes necessários..."
                  />
                </div>
              )}
            </div>
          )}

          {/* Observações quando não há peça gerada */}
          {!pedido.pecaGerada && pedido.observacoes && (
            <div className="p-6">
              <Card variant="bordered">
                <CardContent>
                  <h3 className="text-sm font-medium text-dark-400 mb-2">
                    Observações enviadas:
                  </h3>
                  <p className="text-dark-200 whitespace-pre-wrap">
                    {pedido.observacoes}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
