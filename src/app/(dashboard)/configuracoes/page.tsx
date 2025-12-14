'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Settings,
  FileText,
  Save,
  Loader2,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  RotateCcw,
  Moon,
  Sun,
  Bell,
  Shield,
  Upload,
  File,
  Trash2,
  Download,
  FileCheck,
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
  Toggle,
  Tabs,
  Textarea,
} from '@/components/ui'
import { Header } from '@/components/layout'
import { cn } from '@/lib/utils'
import { FONTES, TAMANHOS_FONTE, ESPACAMENTOS_LINHA, ALINHAMENTOS } from '@/types'

const configSchema = z.object({
  fonte: z.string(),
  tamanhoFonte: z.number().min(8).max(24),
  espacamentoLinha: z.number().min(1).max(3),
  margemSuperior: z.number().min(0).max(10),
  margemInferior: z.number().min(0).max(10),
  margemEsquerda: z.number().min(0).max(10),
  margemDireita: z.number().min(0).max(10),
  cabecalho: z.string().optional(),
  rodape: z.string().optional(),
  alinhamentoTexto: z.enum(['left', 'center', 'right', 'justify']),
  numeracaoPaginas: z.boolean(),
})

type ConfigFormData = z.infer<typeof configSchema>

const ALIGNMENT_ICONS = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
  justify: AlignJustify,
}

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('documento')
  const [modeloBase, setModeloBase] = useState<{ nome: string; url: string } | null>(null)
  const [uploadingModelo, setUploadingModelo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      fonte: 'Times New Roman',
      tamanhoFonte: 12,
      espacamentoLinha: 1.5,
      margemSuperior: 3,
      margemInferior: 2,
      margemEsquerda: 3,
      margemDireita: 2,
      alinhamentoTexto: 'justify',
      numeracaoPaginas: true,
      cabecalho: '',
      rodape: '',
    },
  })

  const alinhamentoTexto = watch('alinhamentoTexto')
  const numeracaoPaginas = watch('numeracaoPaginas')

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/configuracoes')
      if (response.ok) {
        const data = await response.json()
        reset(data)
        if (data.modeloBaseUrl && data.modeloBaseNome) {
          setModeloBase({ nome: data.modeloBaseNome, url: data.modeloBaseUrl })
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ConfigFormData) => {
    setSaving(true)
    try {
      const response = await fetch('/api/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar configurações')
      }

      toast.success('Configurações salvas com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const handleModeloUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
    ]

    if (!allowedTypes.includes(file.type)) {
      toast.error('Apenas arquivos .doc e .docx são permitidos')
      return
    }

    setUploadingModelo(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('tipo', 'modelo')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Erro no upload')
      }

      const data = await response.json()

      // Salvar referência do modelo nas configurações
      await fetch('/api/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modeloBaseUrl: data.caminho,
          modeloBaseNome: file.name,
        }),
      })

      setModeloBase({ nome: file.name, url: data.caminho })
      toast.success('Modelo base enviado com sucesso!')
    } catch (error) {
      toast.error('Erro ao enviar modelo')
    } finally {
      setUploadingModelo(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveModelo = async () => {
    try {
      await fetch('/api/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modeloBaseUrl: null,
          modeloBaseNome: null,
        }),
      })

      setModeloBase(null)
      toast.success('Modelo removido')
    } catch (error) {
      toast.error('Erro ao remover modelo')
    }
  }

  const resetToDefaults = () => {
    reset({
      fonte: 'Times New Roman',
      tamanhoFonte: 12,
      espacamentoLinha: 1.5,
      margemSuperior: 3,
      margemInferior: 2,
      margemEsquerda: 3,
      margemDireita: 2,
      alinhamentoTexto: 'justify',
      numeracaoPaginas: true,
      cabecalho: '',
      rodape: '',
    })
    toast.success('Valores padrão restaurados')
  }

  const tabs = [
    { id: 'documento', label: 'Documento', icon: FileText },
    { id: 'modelo', label: 'Modelo Base', icon: FileCheck },
    { id: 'aparencia', label: 'Aparência', icon: Sun },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'privacidade', label: 'Privacidade', icon: Shield },
  ]

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Configurações" />
        <div className="p-6 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header title="Configurações" />

      <div className="p-6 max-w-5xl mx-auto">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="mt-6">
          {activeTab === 'documento' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Tipografia */}
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="w-5 h-5 text-primary-400" />
                    Tipografia
                  </CardTitle>
                  <CardDescription>
                    Configure a fonte e formatação do texto dos seus documentos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-200 mb-2">
                        Fonte
                      </label>
                      <select
                        className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-700 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        {...register('fonte')}
                      >
                        {FONTES.map((fonte) => (
                          <option key={fonte.value} value={fonte.value}>
                            {fonte.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-200 mb-2">
                        Tamanho da Fonte
                      </label>
                      <select
                        className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-700 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        {...register('tamanhoFonte', { valueAsNumber: true })}
                      >
                        {TAMANHOS_FONTE.map((tamanho) => (
                          <option key={tamanho.value} value={tamanho.value}>
                            {tamanho.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-200 mb-2">
                        Espaçamento entre Linhas
                      </label>
                      <select
                        className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-700 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        {...register('espacamentoLinha', { valueAsNumber: true })}
                      >
                        {ESPACAMENTOS_LINHA.map((esp) => (
                          <option key={esp.value} value={esp.value}>
                            {esp.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Alinhamento */}
                  <div>
                    <label className="block text-sm font-medium text-dark-200 mb-2">
                      Alinhamento do Texto
                    </label>
                    <div className="flex gap-2">
                      {ALINHAMENTOS.map((align) => {
                        const Icon = ALIGNMENT_ICONS[align.value as keyof typeof ALIGNMENT_ICONS]
                        return (
                          <button
                            key={align.value}
                            type="button"
                            onClick={() => setValue('alinhamentoTexto', align.value as any)}
                            className={cn(
                              'flex-1 p-3 rounded-lg border flex flex-col items-center gap-2 transition-all',
                              alinhamentoTexto === align.value
                                ? 'border-primary-500 bg-primary-500/10 text-white'
                                : 'border-dark-700 bg-dark-800 text-dark-400 hover:border-dark-600 hover:text-white'
                            )}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs">{align.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Margens */}
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle>Margens (cm)</CardTitle>
                  <CardDescription>
                    Configure as margens do documento (padrão ABNT: 3cm superior/esquerda, 2cm inferior/direita)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Input
                      label="Superior"
                      type="number"
                      step="0.5"
                      min="0"
                      max="10"
                      error={errors.margemSuperior?.message}
                      {...register('margemSuperior', { valueAsNumber: true })}
                    />
                    <Input
                      label="Inferior"
                      type="number"
                      step="0.5"
                      min="0"
                      max="10"
                      error={errors.margemInferior?.message}
                      {...register('margemInferior', { valueAsNumber: true })}
                    />
                    <Input
                      label="Esquerda"
                      type="number"
                      step="0.5"
                      min="0"
                      max="10"
                      error={errors.margemEsquerda?.message}
                      {...register('margemEsquerda', { valueAsNumber: true })}
                    />
                    <Input
                      label="Direita"
                      type="number"
                      step="0.5"
                      min="0"
                      max="10"
                      error={errors.margemDireita?.message}
                      {...register('margemDireita', { valueAsNumber: true })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Cabeçalho e Rodapé */}
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle>Cabeçalho e Rodapé</CardTitle>
                  <CardDescription>
                    Personalize o cabeçalho e rodapé dos seus documentos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-200 mb-2">
                      Cabeçalho
                    </label>
                    <Textarea
                      placeholder="Ex: Dr. João Silva - OAB/SP 123456"
                      rows={2}
                      {...register('cabecalho')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-200 mb-2">
                      Rodapé
                    </label>
                    <Textarea
                      placeholder="Ex: Rua das Flores, 123 - São Paulo/SP - Tel: (11) 1234-5678"
                      rows={2}
                      {...register('rodape')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-dark-800">
                    <div>
                      <p className="font-medium text-white">Numeração de Páginas</p>
                      <p className="text-sm text-dark-400">
                        Adicionar números de página automaticamente
                      </p>
                    </div>
                    <Toggle
                      enabled={numeracaoPaginas}
                      onChange={(v) => setValue('numeracaoPaginas', v)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetToDefaults}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restaurar Padrões
                </Button>
                <Button
                  type="submit"
                  loading={saving}
                  disabled={!isDirty}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvar Configurações
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'modelo' && (
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-primary-400" />
                  Modelo Base de Documento
                </CardTitle>
                <CardDescription>
                  Envie um documento Word (.docx) que servirá como modelo padrão para todas as peças geradas.
                  A IA utilizará esse modelo para manter o padrão de formatação e estilo do seu escritório.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Area */}
                <div
                  className={cn(
                    'border-2 border-dashed rounded-xl p-8 text-center transition-all',
                    modeloBase
                      ? 'border-green-500/50 bg-green-500/5'
                      : 'border-dark-600 hover:border-primary-500 hover:bg-dark-800/50'
                  )}
                >
                  {modeloBase ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-xl bg-green-500/20 flex items-center justify-center">
                        <FileCheck className="w-8 h-8 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{modeloBase.nome}</p>
                        <p className="text-sm text-dark-400 mt-1">
                          Modelo base configurado com sucesso
                        </p>
                      </div>
                      <div className="flex gap-3 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Substituir
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveModelo}
                          className="gap-2 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-xl bg-dark-700 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-dark-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          Arraste um arquivo ou clique para selecionar
                        </p>
                        <p className="text-sm text-dark-400 mt-1">
                          Formatos aceitos: .doc, .docx
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        loading={uploadingModelo}
                        className="gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Selecionar Arquivo
                      </Button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".doc,.docx"
                    onChange={handleModeloUpload}
                    className="hidden"
                  />
                </div>

                {/* Dicas */}
                <div className="p-4 rounded-lg bg-dark-800 space-y-3">
                  <h4 className="font-medium text-white">Dicas para o modelo base:</h4>
                  <ul className="space-y-2 text-sm text-dark-400">
                    <li className="flex items-start gap-2">
                      <span className="text-primary-400">•</span>
                      Use um documento que represente o padrão do seu escritório
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-400">•</span>
                      Inclua cabeçalho e rodapé formatados como deseja
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-400">•</span>
                      Configure margens, fontes e espaçamento conforme seu padrão
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-400">•</span>
                      O conteúdo do documento será substituído pela peça gerada
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'aparencia' && (
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-primary-400" />
                  Tema e Aparência
                </CardTitle>
                <CardDescription>
                  Personalize a aparência do JurisAI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    className="p-6 rounded-lg border-2 border-primary-500 bg-dark-900 text-left"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Moon className="w-6 h-6 text-primary-400" />
                      <span className="font-medium text-white">Tema Escuro</span>
                    </div>
                    <p className="text-sm text-dark-400">
                      Interface escura para melhor conforto visual em ambientes com pouca luz.
                    </p>
                  </button>

                  <button
                    className="p-6 rounded-lg border border-dark-700 bg-dark-800 text-left opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Sun className="w-6 h-6 text-dark-400" />
                      <span className="font-medium text-dark-400">Tema Claro</span>
                      <span className="text-xs bg-dark-700 px-2 py-1 rounded text-dark-400">
                        Em breve
                      </span>
                    </div>
                    <p className="text-sm text-dark-500">
                      Interface clara para ambientes bem iluminados.
                    </p>
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notificacoes' && (
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary-400" />
                  Preferências de Notificação
                </CardTitle>
                <CardDescription>
                  Configure como e quando deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-dark-800">
                  <div>
                    <p className="font-medium text-white">Notificações por Email</p>
                    <p className="text-sm text-dark-400">
                      Receber atualizações importantes por email
                    </p>
                  </div>
                  <Toggle enabled={true} onChange={() => toast('Funcionalidade em breve')} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-dark-800">
                  <div>
                    <p className="font-medium text-white">Pedido Concluído</p>
                    <p className="text-sm text-dark-400">
                      Notificar quando uma peça for gerada
                    </p>
                  </div>
                  <Toggle enabled={true} onChange={() => toast('Funcionalidade em breve')} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-dark-800">
                  <div>
                    <p className="font-medium text-white">Lembrete de Prazos</p>
                    <p className="text-sm text-dark-400">
                      Alertas de prazos próximos do vencimento
                    </p>
                  </div>
                  <Toggle enabled={true} onChange={() => toast('Funcionalidade em breve')} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-dark-800">
                  <div>
                    <p className="font-medium text-white">Novidades e Dicas</p>
                    <p className="text-sm text-dark-400">
                      Informações sobre novas funcionalidades
                    </p>
                  </div>
                  <Toggle enabled={false} onChange={() => toast('Funcionalidade em breve')} />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'privacidade' && (
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-400" />
                  Privacidade e Segurança
                </CardTitle>
                <CardDescription>
                  Gerencie suas configurações de privacidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-dark-800">
                  <h4 className="font-medium text-white mb-2">Seus Dados</h4>
                  <p className="text-sm text-dark-400 mb-4">
                    Todos os seus documentos e dados são criptografados e armazenados de forma segura.
                    Você pode solicitar a exclusão completa dos seus dados a qualquer momento.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                      Exportar Meus Dados
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                      Excluir Minha Conta
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-dark-800">
                  <div>
                    <p className="font-medium text-white">Histórico de Atividades</p>
                    <p className="text-sm text-dark-400">
                      Manter registro de suas ações na plataforma
                    </p>
                  </div>
                  <Toggle enabled={true} onChange={() => toast('Funcionalidade em breve')} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-dark-800">
                  <div>
                    <p className="font-medium text-white">Autenticação em Duas Etapas</p>
                    <p className="text-sm text-dark-400">
                      Adicionar uma camada extra de segurança
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configurar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
