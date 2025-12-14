import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const createPedidoSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  tipoPeca: z.string().min(1, 'Selecione o tipo de peça'),
  nomeCliente: z.string().optional(),
  processoNumero: z.string().optional(),
  vara: z.string().optional(),
  tribunal: z.string().optional(),
  comarca: z.string().optional(),
  parteAutora: z.string().optional(),
  parteRe: z.string().optional(),
  observacoes: z.string().optional(),
  documentoIds: z.array(z.string()).optional(),
  pastaId: z.string().optional(),
})

// GET - Listar pedidos do usuário
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const busca = searchParams.get('busca')
    const status = searchParams.get('status')
    const pastaId = searchParams.get('pastaId')
    const favoritos = searchParams.get('favoritos') === 'true'
    const limite = parseInt(searchParams.get('limite') || '50')
    const pagina = parseInt(searchParams.get('pagina') || '1')

    // Construir filtro
    const where: any = { userId: session.user.id }

    if (busca) {
      where.OR = [
        { titulo: { contains: busca } },
        { nomeCliente: { contains: busca } },
        { processoNumero: { contains: busca } },
        { observacoes: { contains: busca } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (pastaId) {
      where.pastaId = pastaId
    }

    if (favoritos) {
      where.favorito = true
    }

    const [pedidos, total] = await Promise.all([
      prisma.pedido.findMany({
        where,
        include: {
          documentos: true,
          tags: {
            include: {
              tag: true,
            },
          },
          pasta: true,
          _count: {
            select: { mensagens: true, versoes: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      prisma.pedido.count({ where }),
    ])

    return NextResponse.json({
      pedidos,
      total,
      paginas: Math.ceil(total / limite),
      paginaAtual: pagina,
    })
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
        nomeCliente: data.nomeCliente,
        processoNumero: data.processoNumero,
        vara: data.vara,
        tribunal: data.tribunal,
        comarca: data.comarca,
        parteAutora: data.parteAutora,
        parteRe: data.parteRe,
        observacoes: data.observacoes,
        pastaId: data.pastaId,
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
