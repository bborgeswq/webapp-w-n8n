import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const updateConfigSchema = z.object({
  fonte: z.string().optional(),
  tamanhoFonte: z.number().min(8).max(24).optional(),
  espacamentoLinha: z.number().min(1).max(3).optional(),
  margemSuperior: z.number().min(0).max(10).optional(),
  margemInferior: z.number().min(0).max(10).optional(),
  margemEsquerda: z.number().min(0).max(10).optional(),
  margemDireita: z.number().min(0).max(10).optional(),
  cabecalho: z.string().optional().nullable(),
  rodape: z.string().optional().nullable(),
  alinhamentoTexto: z.enum(['left', 'center', 'right', 'justify']).optional(),
  numeracaoPaginas: z.boolean().optional(),
  assinaturaDigital: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  modeloBaseUrl: z.string().optional().nullable(),
  modeloBaseNome: z.string().optional().nullable(),
})

// GET - Obter configurações do usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Tentar buscar configurações existentes
    let config = await prisma.userConfig.findUnique({
      where: { userId: session.user.id },
    })

    // Se não existir, criar com valores padrão
    if (!config) {
      config = await prisma.userConfig.create({
        data: {
          userId: session.user.id,
          fonte: 'Times New Roman',
          tamanhoFonte: 12,
          espacamentoLinha: 1.5,
          margemSuperior: 3,
          margemInferior: 2,
          margemEsquerda: 3,
          margemDireita: 2,
          alinhamentoTexto: 'justify',
          numeracaoPaginas: true,
        },
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Erro ao obter configurações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar configurações
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const data = updateConfigSchema.parse(body)

    const config = await prisma.userConfig.upsert({
      where: { userId: session.user.id },
      update: data,
      create: {
        userId: session.user.id,
        ...data,
      },
    })

    return NextResponse.json(config)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar configurações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
