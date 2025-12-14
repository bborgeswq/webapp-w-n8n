'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Send, Scale, Sparkles, FileText, ChevronDown, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  Button,
  Input,
  Select,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Toggle,
  Badge,
} from '@/components/ui'
import { Header } from '@/components/layout'
import { FileUpload } from '@/components/forms/FileUpload'
import { TIPOS_PECA } from '@/types'

const pedidoSchema = z.object({
  tipoPeca: z.string().min(1, 'Selecione o tipo de peça'),
  nomeCliente: z.string().min(2, 'Informe o nome do cliente'),
  processoNumero: z.string().optional(),
  vara: z.string().optional(),
  tribunal: z.string().optional(),
  comarca: z.string().optional(),
  parteAutora: z.string().optional(),
  parteRe: z.string().optional(),
  observacoes: z.string().optional(),
})

type PedidoFormData = z.infer<typeof pedidoSchema>

interface UploadedFile {
  id: string
  nome: string
  tipo: string
  tamanho: number
  caminho: string
}

export default function NovoPedidoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [mostrarInfoProcesso, setMostrarInfoProcesso] = useState(false)
  const [selectedTipoPeca, setSelectedTipoPeca] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PedidoFormData>({
    resolver: zodResolver(pedidoSchema),
    defaultValues: {
      tipoPeca: '',
      nomeCliente: '',
    },
  })

  const nomeCliente = watch('nomeCliente')
  const tipoPeca = watch('tipoPeca')

  // Gerar título automático baseado no tipo de peça e cliente
  const gerarTituloAutomatico = () => {
    if (!tipoPeca || !nomeCliente) return ''
    const tipo = TIPOS_PECA.find(t => t.value === tipoPeca)
    return `${tipo?.label || 'Documento'} - ${nomeCliente}`
  }

  const onSubmit = async (data: PedidoFormData) => {
    if (files.length === 0) {
      toast.error('Anexe pelo menos um documento do processo')
      return
    }

    setLoading(true)
    try {
      // Gerar título automaticamente
      const titulo = gerarTituloAutomatico()

      // Criar pedido
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          titulo,
          documentoIds: files.map((f) => f.id),
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Erro ao criar pedido')
      }

      const pedido = await response.json()

      // Enviar para processamento
      const processResponse = await fetch(`/api/pedidos/${pedido.id}/process`, {
        method: 'POST',
      })

      if (!processResponse.ok) {
        console.error('Erro ao processar pedido')
      }

      toast.success('Pedido criado e enviado para processamento!')
      router.push(`/pedidos/${pedido.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar pedido')
    } finally {
      setLoading(false)
    }
  }

  const handleTipoPecaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSelectedTipoPeca(value)
    setValue('tipoPeca', value)
  }

  return (
    <div className="min-h-screen">
      <Header title="Novo Pedido" />

      <div className="p-6 max-w-4xl mx-auto">
        {/* Welcome Card */}
        <Card className="mb-8 bg-gradient-to-r from-primary-900/50 to-dark-800 border border-primary-800/50">
          <CardContent className="py-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white mb-2">
                  Criar Nova Peça Jurídica
                </h2>
                <p className="text-dark-300">
                  Selecione o tipo de peça, informe seu cliente e anexe os documentos do processo.
                  Nossa IA irá extrair automaticamente as informações necessárias e gerar a peça.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Sparkles className="w-4 h-4 text-primary-400" />
                  <span className="text-sm text-primary-400">
                    Suporte a arquivos de até 150MB para processos completos
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Essenciais */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-400" />
                Informações Essenciais
              </CardTitle>
              <CardDescription>
                Apenas o essencial - a IA extrai o resto dos documentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Tipo de Peça */}
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Tipo de Peça Jurídica *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {TIPOS_PECA.map((tipo) => (
                    <button
                      key={tipo.value}
                      type="button"
                      onClick={() => {
                        setSelectedTipoPeca(tipo.value)
                        setValue('tipoPeca', tipo.value)
                      }}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedTipoPeca === tipo.value
                          ? 'border-primary-500 bg-primary-500/10 text-white'
                          : 'border-dark-600 bg-dark-800 text-dark-300 hover:border-dark-500 hover:text-white'
                      }`}
                    >
                      <span className="text-sm font-medium block">{tipo.label}</span>
                    </button>
                  ))}
                </div>
                {errors.tipoPeca && (
                  <p className="mt-2 text-sm text-red-400">{errors.tipoPeca.message}</p>
                )}
              </div>

              {/* Nome do Cliente */}
              <Input
                label="Nome do Cliente (quem você defende) *"
                placeholder="Ex: João da Silva"
                helperText="Informe o nome da parte que você representa neste processo"
                error={errors.nomeCliente?.message}
                {...register('nomeCliente')}
              />

              {/* Preview do título */}
              {tipoPeca && nomeCliente && (
                <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700">
                  <p className="text-xs text-dark-400 mb-1">Título gerado automaticamente:</p>
                  <p className="text-white font-medium">{gerarTituloAutomatico()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Toggle para Informações do Processo */}
          <Card variant="bordered">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-dark-400" />
                  <div>
                    <p className="text-white font-medium">Informações do Processo</p>
                    <p className="text-sm text-dark-400">
                      Preencher manualmente (opcional - a IA pode extrair dos documentos)
                    </p>
                  </div>
                </div>
                <Toggle
                  enabled={mostrarInfoProcesso}
                  onChange={setMostrarInfoProcesso}
                  size="md"
                />
              </div>

              {/* Campos expandíveis */}
              {mostrarInfoProcesso && (
                <div className="mt-6 pt-6 border-t border-dark-700 space-y-4 animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Número do Processo"
                      placeholder="0000000-00.0000.0.00.0000"
                      {...register('processoNumero')}
                    />
                    <Input
                      label="Tribunal"
                      placeholder="TJSP, TRT-2, etc."
                      {...register('tribunal')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Vara"
                      placeholder="1ª Vara Cível"
                      {...register('vara')}
                    />
                    <Input
                      label="Comarca"
                      placeholder="São Paulo - SP"
                      {...register('comarca')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Parte Autora / Requerente"
                      placeholder="Nome completo"
                      {...register('parteAutora')}
                    />
                    <Input
                      label="Parte Ré / Requerido"
                      placeholder="Nome completo"
                      {...register('parteRe')}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documentos */}
          <Card variant="bordered">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documentos do Processo *</CardTitle>
                  <CardDescription>
                    Anexe a cópia integral do processo ou os documentos relevantes (PDF, DOC, imagens)
                  </CardDescription>
                </div>
                <Badge variant="info">Até 150MB por arquivo</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFilesChange={setFiles}
                maxFiles={20}
              />
              {files.length === 0 && (
                <p className="text-sm text-dark-500 mt-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Dica: Você pode anexar o processo inteiro em um único PDF para facilitar
                </p>
              )}
            </CardContent>
          </Card>

          {/* Observações */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Instruções Adicionais</CardTitle>
              <CardDescription>
                Argumentos específicos, estratégias ou qualquer instrução para a elaboração da peça
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Ex: Focar na tese de prescrição intercorrente. Citar o precedente do STJ no REsp 1.xxx.xxx..."
                rows={5}
                {...register('observacoes')}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-dark-400">
              * Campos obrigatórios
            </p>
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="gap-2"
                disabled={files.length === 0}
              >
                <Send className="w-4 h-4" />
                Gerar Peça
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
