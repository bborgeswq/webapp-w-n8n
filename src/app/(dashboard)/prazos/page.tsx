'use client'

import { useState, useEffect } from 'react'
import {
  CalendarClock,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle,
  Calendar,
  Loader2,
  Trash2,
  Edit,
  Filter,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Modal,
  Textarea,
  SearchInput,
  EmptyState,
} from '@/components/ui'
import { Header } from '@/components/layout'
import { cn, formatDate } from '@/lib/utils'

interface Prazo {
  id: string
  titulo: string
  descricao: string | null
  dataVencimento: string
  tipo: string
  prioridade: string
  status: string
  processoNumero: string | null
  nomeCliente: string | null
  lembrete: boolean
  diasLembrete: number
  createdAt: string
  pedido?: {
    id: string
    titulo: string
    tipoPeca: string
  } | null
}

interface Estatisticas {
  vencidos: number
  hoje: number
  semana: number
  pendentes: number
}

const TIPOS_PRAZO = [
  { value: 'fatal', label: 'Fatal' },
  { value: 'judicial', label: 'Judicial' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'interno', label: 'Interno' },
  { value: 'outros', label: 'Outros' },
]

const PRIORIDADES = [
  { value: 'baixa', label: 'Baixa', color: 'text-green-400' },
  { value: 'media', label: 'Média', color: 'text-yellow-400' },
  { value: 'alta', label: 'Alta', color: 'text-orange-400' },
  { value: 'urgente', label: 'Urgente', color: 'text-red-400' },
]

const STATUS_PRAZO = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
]

export default function PrazosPage() {
  const [prazos, setPrazos] = useState<Prazo[]>([])
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    vencidos: 0,
    hoje: 0,
    semana: 0,
    pendentes: 0,
  })
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroPrioridade, setFiltroPrioridade] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingPrazo, setEditingPrazo] = useState<Prazo | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    dataVencimento: '',
    tipo: 'judicial',
    prioridade: 'media',
    processoNumero: '',
    nomeCliente: '',
    lembrete: true,
    diasLembrete: 3,
  })

  useEffect(() => {
    fetchPrazos()
  }, [busca, filtroStatus, filtroPrioridade])

  const fetchPrazos = async () => {
    try {
      const params = new URLSearchParams()
      if (busca) params.append('busca', busca)
      if (filtroStatus) params.append('status', filtroStatus)
      if (filtroPrioridade) params.append('prioridade', filtroPrioridade)

      const response = await fetch(`/api/prazos?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPrazos(data.prazos)
        setEstatisticas(data.estatisticas)
      }
    } catch (error) {
      console.error('Erro ao carregar prazos:', error)
    } finally {
      setLoading(false)
    }
  }

  const openNewModal = () => {
    setEditingPrazo(null)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setFormData({
      titulo: '',
      descricao: '',
      dataVencimento: tomorrow.toISOString().split('T')[0],
      tipo: 'judicial',
      prioridade: 'media',
      processoNumero: '',
      nomeCliente: '',
      lembrete: true,
      diasLembrete: 3,
    })
    setShowModal(true)
  }

  const openEditModal = (prazo: Prazo) => {
    setEditingPrazo(prazo)
    setFormData({
      titulo: prazo.titulo,
      descricao: prazo.descricao || '',
      dataVencimento: new Date(prazo.dataVencimento).toISOString().split('T')[0],
      tipo: prazo.tipo,
      prioridade: prazo.prioridade,
      processoNumero: prazo.processoNumero || '',
      nomeCliente: prazo.nomeCliente || '',
      lembrete: prazo.lembrete,
      diasLembrete: prazo.diasLembrete,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.titulo || !formData.dataVencimento) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    setSaving(true)
    try {
      const url = editingPrazo ? `/api/prazos/${editingPrazo.id}` : '/api/prazos'
      const method = editingPrazo ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error()

      toast.success(editingPrazo ? 'Prazo atualizado!' : 'Prazo criado!')
      setShowModal(false)
      fetchPrazos()
    } catch (error) {
      toast.error('Erro ao salvar prazo')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este prazo?')) return

    try {
      const response = await fetch(`/api/prazos/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error()

      toast.success('Prazo excluído!')
      fetchPrazos()
    } catch (error) {
      toast.error('Erro ao excluir prazo')
    }
  }

  const toggleStatus = async (prazo: Prazo) => {
    const newStatus = prazo.status === 'concluido' ? 'pendente' : 'concluido'
    try {
      const response = await fetch(`/api/prazos/${prazo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error()

      toast.success(newStatus === 'concluido' ? 'Prazo concluído!' : 'Prazo reaberto')
      fetchPrazos()
    } catch (error) {
      toast.error('Erro ao atualizar status')
    }
  }

  const getPrioridadeBadge = (prioridade: string) => {
    const p = PRIORIDADES.find(pr => pr.value === prioridade)
    const variants: Record<string, any> = {
      baixa: 'success',
      media: 'warning',
      alta: 'warning',
      urgente: 'danger',
    }
    return <Badge variant={variants[prioridade] || 'default'}>{p?.label || prioridade}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pendente: 'warning',
      em_andamento: 'info',
      concluido: 'success',
      cancelado: 'default',
    }
    const s = STATUS_PRAZO.find(st => st.value === status)
    return <Badge variant={variants[status] || 'default'}>{s?.label || status}</Badge>
  }

  const isVencido = (data: string, status: string) => {
    if (status === 'concluido' || status === 'cancelado') return false
    return new Date(data) < new Date()
  }

  const isHoje = (data: string) => {
    const hoje = new Date()
    const dataVenc = new Date(data)
    return hoje.toDateString() === dataVenc.toDateString()
  }

  return (
    <div className="min-h-screen">
      <Header title="Gerenciamento de Prazos" />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card variant="bordered" className={cn(estatisticas.vencidos > 0 && 'border-red-500/50')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  estatisticas.vencidos > 0 ? 'bg-red-600/20' : 'bg-dark-700'
                )}>
                  <AlertTriangle className={cn(
                    'w-6 h-6',
                    estatisticas.vencidos > 0 ? 'text-red-400' : 'text-dark-400'
                  )} />
                </div>
                <div>
                  <p className={cn(
                    'text-2xl font-bold',
                    estatisticas.vencidos > 0 ? 'text-red-400' : 'text-white'
                  )}>
                    {estatisticas.vencidos}
                  </p>
                  <p className="text-sm text-dark-400">Vencidos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered" className={cn(estatisticas.hoje > 0 && 'border-yellow-500/50')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  estatisticas.hoje > 0 ? 'bg-yellow-600/20' : 'bg-dark-700'
                )}>
                  <Clock className={cn(
                    'w-6 h-6',
                    estatisticas.hoje > 0 ? 'text-yellow-400' : 'text-dark-400'
                  )} />
                </div>
                <div>
                  <p className={cn(
                    'text-2xl font-bold',
                    estatisticas.hoje > 0 ? 'text-yellow-400' : 'text-white'
                  )}>
                    {estatisticas.hoje}
                  </p>
                  <p className="text-sm text-dark-400">Vencem Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{estatisticas.semana}</p>
                  <p className="text-sm text-dark-400">Esta Semana</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center">
                  <CalendarClock className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{estatisticas.pendentes}</p>
                  <p className="text-sm text-dark-400">Total Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchInput
              value={busca}
              onChange={setBusca}
              placeholder="Buscar prazos..."
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-700 text-white focus:border-primary-500"
            >
              <option value="">Todos os status</option>
              {STATUS_PRAZO.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <select
              value={filtroPrioridade}
              onChange={(e) => setFiltroPrioridade(e.target.value)}
              className="px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-700 text-white focus:border-primary-500"
            >
              <option value="">Todas prioridades</option>
              {PRIORIDADES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <Button onClick={openNewModal} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Prazo
            </Button>
          </div>
        </div>

        {/* Prazos List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : prazos.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Nenhum prazo encontrado"
            description="Adicione prazos para acompanhar suas obrigações e nunca perder um vencimento."
            action={
              <Button onClick={openNewModal} className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Prazo
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {prazos.map((prazo) => {
              const vencido = isVencido(prazo.dataVencimento, prazo.status)
              const hoje = isHoje(prazo.dataVencimento)
              const concluido = prazo.status === 'concluido'

              return (
                <Card
                  key={prazo.id}
                  variant="bordered"
                  className={cn(
                    'transition-all',
                    vencido && 'border-red-500/50 bg-red-500/5',
                    hoje && !concluido && 'border-yellow-500/50 bg-yellow-500/5',
                    concluido && 'opacity-60'
                  )}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleStatus(prazo)}
                        className={cn(
                          'w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-colors',
                          concluido
                            ? 'bg-green-500 border-green-500'
                            : 'border-dark-600 hover:border-primary-500'
                        )}
                      >
                        {concluido && <CheckCircle className="w-4 h-4 text-white" />}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className={cn(
                              'font-medium text-white',
                              concluido && 'line-through text-dark-400'
                            )}>
                              {prazo.titulo}
                            </h3>
                            {prazo.descricao && (
                              <p className="text-sm text-dark-400 mt-1">{prazo.descricao}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {getPrioridadeBadge(prazo.prioridade)}
                              {getStatusBadge(prazo.status)}
                              <Badge variant="outline">
                                {TIPOS_PRAZO.find(t => t.value === prazo.tipo)?.label || prazo.tipo}
                              </Badge>
                              {prazo.processoNumero && (
                                <span className="text-xs text-dark-500">
                                  Processo: {prazo.processoNumero}
                                </span>
                              )}
                              {prazo.nomeCliente && (
                                <span className="text-xs text-dark-500">
                                  Cliente: {prazo.nomeCliente}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Date & Actions */}
                          <div className="text-right flex-shrink-0">
                            <div className={cn(
                              'text-sm font-medium',
                              vencido ? 'text-red-400' :
                              hoje ? 'text-yellow-400' :
                              'text-dark-300'
                            )}>
                              {vencido && 'VENCIDO - '}
                              {hoje && !concluido && 'HOJE - '}
                              {formatDate(prazo.dataVencimento)}
                            </div>
                            <div className="flex gap-1 mt-2 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(prazo)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300"
                                onClick={() => handleDelete(prazo.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Criar/Editar */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPrazo ? 'Editar Prazo' : 'Novo Prazo'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Título *"
            placeholder="Ex: Contestação - Processo 123456"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Data de Vencimento *"
              type="date"
              value={formData.dataVencimento}
              onChange={(e) => setFormData({ ...formData, dataVencimento: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Tipo de Prazo
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-700 text-white focus:border-primary-500"
              >
                {TIPOS_PRAZO.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Prioridade
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORIDADES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, prioridade: p.value })}
                  className={cn(
                    'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                    formData.prioridade === p.value
                      ? 'border-primary-500 bg-primary-500/10 text-white'
                      : 'border-dark-700 bg-dark-800 text-dark-300 hover:border-dark-600'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Descrição
            </label>
            <Textarea
              placeholder="Detalhes sobre o prazo..."
              rows={3}
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Número do Processo"
              placeholder="0000000-00.0000.0.00.0000"
              value={formData.processoNumero}
              onChange={(e) => setFormData({ ...formData, processoNumero: e.target.value })}
            />
            <Input
              label="Nome do Cliente"
              placeholder="Nome do cliente"
              value={formData.nomeCliente}
              onChange={(e) => setFormData({ ...formData, nomeCliente: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editingPrazo ? 'Salvar Alterações' : 'Criar Prazo'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
