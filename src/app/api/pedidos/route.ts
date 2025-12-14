import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const createPedidoSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  tipoPeca: z.string().min(1, 'Selecione o tipo de peça'),
  processoNumero: z.string().optional(),
  vara: z.string().optional(),
  parteAutora: z.string().optional(),
  parteRe: z.string().optional(),
  observacoes: z.string().optional(),
  documentoIds: z.array(z.string()).optional(),
})

// GET - Listar pedidos do usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const pedidos = await prisma.pedido.findMany({
      where: { userId: session.user.id },
      include: {
        documentos: true,
        _count: {
          select: { mensagens: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(pedidos)
  } catch (error) {
    console.error('Erro ao listar pedidos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo pedido
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const data = createPedidoSchema.parse(body)

    const pedido = await prisma.pedido.create({
      data: {
        titulo: data.titulo,
        tipoPeca: data.tipoPeca,
        processoNumero: data.processoNumero,
        vara: data.vara,
        parteAutora: data.parteAutora,
        parteRe: data.parteRe,
        observacoes: data.observacoes,
        userId: session.user.id,
        status: 'pendente',
      },
      include: {
        documentos: true,
      },
    })

    // Se houver documentos, vincular ao pedido
    if (data.documentoIds && data.documentoIds.length > 0) {
      await prisma.documento.updateMany({
        where: {
          id: { in: data.documentoIds },
        },
        data: {
          pedidoId: pedido.id,
        },
      })
    }

    return NextResponse.json(pedido, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Erro ao criar pedido:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
