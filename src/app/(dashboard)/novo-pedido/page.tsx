'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileText, Send, Scale } from 'lucide-react'
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
} from '@/components/ui'
import { Header } from '@/components/layout'
import { FileUpload } from '@/components/forms/FileUpload'
import { TIPOS_PECA } from '@/types'

const pedidoSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  tipoPeca: z.string().min(1, 'Selecione o tipo de peça'),
  processoNumero: z.string().optional(),
  vara: z.string().optional(),
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PedidoFormData>({
    resolver: zodResolver(pedidoSchema),
    defaultValues: {
      tipoPeca: '',
    },
  })

  const onSubmit = async (data: PedidoFormData) => {
    setLoading(true)
    try {
      // Criar pedido
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
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
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Criar Nova Peça Jurídica
                </h2>
                <p className="text-dark-300">
                  Preencha o formulário abaixo com as informações do processo e anexe os documentos relevantes.
                  Nossa IA irá analisar o contexto e gerar a peça jurídica solicitada.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Básicas */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Informações do Pedido</CardTitle>
              <CardDescription>
                Dados básicos sobre a peça jurídica que você deseja criar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Título do Pedido"
                placeholder="Ex: Petição Inicial - Ação de Indenização"
                error={errors.titulo?.message}
                {...register('titulo')}
              />

              <Select
                label="Tipo de Peça"
                placeholder="Selecione o tipo de peça"
                options={TIPOS_PECA}
                error={errors.tipoPeca?.message}
                {...register('tipoPeca')}
              />
            </CardContent>
          </Card>

          {/* Informações do Processo */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Informações do Processo</CardTitle>
              <CardDescription>
                Dados do processo (opcional, mas ajuda na contextualização)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Número do Processo"
                  placeholder="0000000-00.0000.0.00.0000"
                  {...register('processoNumero')}
                />

                <Input
                  label="Vara / Tribunal"
                  placeholder="1ª Vara Cível de São Paulo"
                  {...register('vara')}
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
            </CardContent>
          </Card>

          {/* Documentos */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Documentos do Processo</CardTitle>
              <CardDescription>
                Anexe documentos que servirão de contexto para a criação da peça (petição inicial, contestação, decisões, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload onFilesChange={setFiles} maxFiles={10} />
            </CardContent>
          </Card>

          {/* Observações */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Observações e Instruções</CardTitle>
              <CardDescription>
                Adicione observações, argumentos específicos ou instruções para a elaboração da peça
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Descreva pontos específicos que deseja que sejam abordados, argumentos a serem utilizados, ou qualquer outra instrução relevante..."
                rows={6}
                {...register('observacoes')}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={loading} className="gap-2">
              <Send className="w-4 h-4" />
              Enviar Pedido
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
