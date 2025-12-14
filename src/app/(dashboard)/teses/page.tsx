'use client'

import { useState, useEffect } from 'react'
import {
  BookOpen,
  Plus,
  Search,
  Star,
  Trash2,
  Edit,
  Copy,
  Loader2,
  Filter,
  X,
  ChevronDown,
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
import { cn } from '@/lib/utils'
import { AREAS_DIREITO } from '@/types'

interface Tese {
  id: string
  titulo: string
  descricao: string | null
  conteudo: string
  areaDireito: string
  tags: string
  fontes: string | null
  favorito: boolean
  createdAt: string
  updatedAt: string
}

export default function TesesPage() {
  const [teses, setTeses] = useState<Tese[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [areaDireito, setAreaDireito] = useState('')
  const [apenaseFavoritos, setApenasFavoritos] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingTese, setEditingTese] = useState<Tese | null>(null)
  const [saving, setSaving] = useState(false)
  const [selectedTese, setSelectedTese] = useState<Tese | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    conteudo: '',
    areaDireito: '',
    tags: '',
    fontes: '',
  })

  useEffect(() => {
    fetchTeses()
  }, [busca, areaDireito, apenaseFavoritos])

  const fetchTeses = async () => {
    try {
      const params = new URLSearchParams()
      if (busca) params.append('busca', busca)
      if (areaDireito) params.append('areaDireito', areaDireito)
      if (apenaseFavoritos) params.append('favoritos', 'true')

      const response = await fetch(`/api/teses?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTeses(data.teses)
      }
    } catch (error) {
      console.error('Erro ao carregar teses:', error)
    } finally {
      setLoading(false)
    }
  }

  const openNewModal = () => {
    setEditingTese(null)
    setFormData({
      titulo: '',
      descricao: '',
      conteudo: '',
      areaDireito: '',
      tags: '',
      fontes: '',
    })
    setShowModal(true)
  }

  const openEditModal = (tese: Tese) => {
    setEditingTese(tese)
    setFormData({
      titulo: tese.titulo,
      descricao: tese.descricao || '',
      conteudo: tese.conteudo,
      areaDireito: tese.areaDireito,
      tags: tese.tags,
      fontes: tese.fontes || '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.titulo || !formData.conteudo || !formData.areaDireito) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setSaving(true)
    try {
      const url = editingTese ? `/api/teses/${editingTese.id}` : '/api/teses'
      const method = editingTese ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar tese')
      }

      toast.success(editingTese ? 'Tese atualizada!' : 'Tese criada!')
      setShowModal(false)
      fetchTeses()
    } catch (error) {
      toast.error('Erro ao salvar tese')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tese?')) return

    try {
      const response = await fetch(`/api/teses/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error()

      toast.success('Tese excluída!')
      setSelectedTese(null)
      fetchTeses()
    } catch (error) {
      toast.error('Erro ao excluir tese')
    }
  }

  const toggleFavorito = async (tese: Tese) => {
    try {
      const response = await fetch(`/api/teses/${tese.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorito: !tese.favorito }),
      })

      if (!response.ok) throw new Error()

      fetchTeses()
      toast.success(tese.favorito ? 'Removido dos favoritos' : 'Adicionado aos favoritos')
    } catch (error) {
      toast.error('Erro ao atualizar favorito')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado para a área de transferência!')
  }

  const getAreaLabel = (value: string) => {
    return AREAS_DIREITO.find(a => a.value === value)?.label || value
  }

  return (
    <div className="min-h-screen">
      <Header title="Biblioteca de Teses" />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchInput
              value={busca}
              onChange={setBusca}
              placeholder="Buscar teses..."
            />
          </div>
          <div className="flex gap-2">
            <select
              value={areaDireito}
              onChange={(e) => setAreaDireito(e.target.value)}
              className="px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-700 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Todas as áreas</option>
              {AREAS_DIREITO.map((area) => (
                <option key={area.value} value={area.value}>
                  {area.label}
                </option>
              ))}
            </select>
            <Button
              variant={apenaseFavoritos ? 'default' : 'outline'}
              onClick={() => setApenasFavoritos(!apenaseFavoritos)}
              className="gap-2"
            >
              <Star className={cn('w-4 h-4', apenaseFavoritos && 'fill-current')} />
              Favoritos
            </Button>
            <Button onClick={openNewModal} className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Tese
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Teses */}
          <div className="lg:col-span-1 space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              </div>
            ) : teses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Nenhuma tese encontrada"
                description="Crie sua primeira tese para começar a construir sua biblioteca de argumentos jurídicos."
                action={
                  <Button onClick={openNewModal} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Criar Tese
                  </Button>
                }
              />
            ) : (
              teses.map((tese) => (
                <Card
                  key={tese.id}
                  variant="bordered"
                  className={cn(
                    'cursor-pointer transition-all hover:border-primary-600',
                    selectedTese?.id === tese.id && 'border-primary-500 bg-primary-500/5'
                  )}
                  onClick={() => setSelectedTese(tese)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-white truncate">
                            {tese.titulo}
                          </h3>
                          {tese.favorito && (
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                          )}
                        </div>
                        <Badge variant="default" className="mb-2">
                          {getAreaLabel(tese.areaDireito)}
                        </Badge>
                        {tese.descricao && (
                          <p className="text-sm text-dark-400 line-clamp-2">
                            {tese.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Detalhe da Tese */}
          <div className="lg:col-span-2">
            {selectedTese ? (
              <Card variant="bordered" className="sticky top-6">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {selectedTese.titulo}
                        {selectedTese.favorito && (
                          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        )}
                      </CardTitle>
                      <CardDescription>
                        <Badge variant="default" className="mt-2">
                          {getAreaLabel(selectedTese.areaDireito)}
                        </Badge>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorito(selectedTese)}
                      >
                        <Star className={cn(
                          'w-4 h-4',
                          selectedTese.favorito && 'fill-yellow-400 text-yellow-400'
                        )} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(selectedTese.conteudo)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(selectedTese)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => handleDelete(selectedTese.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedTese.descricao && (
                    <div>
                      <h4 className="text-sm font-medium text-dark-400 mb-1">Descrição</h4>
                      <p className="text-white">{selectedTese.descricao}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-dark-400 mb-1">Conteúdo</h4>
                    <div className="p-4 rounded-lg bg-dark-800 max-h-96 overflow-y-auto">
                      <p className="text-white whitespace-pre-wrap">{selectedTese.conteudo}</p>
                    </div>
                  </div>

                  {selectedTese.tags && (
                    <div>
                      <h4 className="text-sm font-medium text-dark-400 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTese.tags.split(',').filter(Boolean).map((tag, i) => (
                          <Badge key={i} variant="outline">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTese.fontes && (
                    <div>
                      <h4 className="text-sm font-medium text-dark-400 mb-1">Fontes / Referências</h4>
                      <p className="text-dark-300 text-sm">{selectedTese.fontes}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-dark-700">
                    <Button
                      onClick={() => copyToClipboard(selectedTese.conteudo)}
                      className="w-full gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copiar Conteúdo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card variant="bordered" className="h-full flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <BookOpen className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                  <p className="text-dark-400">Selecione uma tese para visualizar</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modal Criar/Editar */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTese ? 'Editar Tese' : 'Nova Tese'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Título *"
            placeholder="Ex: Prescrição Intercorrente na Execução Fiscal"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Área do Direito *
            </label>
            <select
              value={formData.areaDireito}
              onChange={(e) => setFormData({ ...formData, areaDireito: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-700 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Selecione...</option>
              {AREAS_DIREITO.map((area) => (
                <option key={area.value} value={area.value}>
                  {area.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Descrição
            </label>
            <Textarea
              placeholder="Breve descrição da tese..."
              rows={2}
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Conteúdo da Tese *
            </label>
            <Textarea
              placeholder="Digite o argumento jurídico completo..."
              rows={8}
              value={formData.conteudo}
              onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
            />
          </div>

          <Input
            label="Tags (separadas por vírgula)"
            placeholder="prescrição, execução fiscal, tributário"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Fontes / Referências
            </label>
            <Textarea
              placeholder="STJ REsp xxx, STF RE xxx, Art. xxx do CPC..."
              rows={2}
              value={formData.fontes}
              onChange={(e) => setFormData({ ...formData, fontes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editingTese ? 'Salvar Alterações' : 'Criar Tese'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
