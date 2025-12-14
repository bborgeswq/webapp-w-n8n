import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const createPrazoSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  descricao: z.string().optional(),
  dataVencimento: z.string(),
  tipo: z.enum(['fatal', 'judicial', 'administrativo', 'interno', 'outros']),
  prioridade: z.enum(['baixa', 'media', 'alta', 'urgente']),
  processoNumero: z.string().optional(),
  nomeCliente: z.string().optional(),
  pedidoId: z.string().optional(),
  lembrete: z.boolean().optional(),
  diasLembrete: z.number().optional(),
})

// GET - Listar prazos
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const busca = searchParams.get('busca')
    const status = searchParams.get('status')
    const prioridade = searchParams.get('prioridade')
    const proximosDias = searchParams.get('proximosDias')
    const limite = parseInt(searchParams.get('limite') || '50')
    const pagina = parseInt(searchParams.get('pagina') || '1')

    const where: any = { userId: session.user.id }

    if (busca) {
      where.OR = [
        { titulo: { contains: busca } },
        { descricao: { contains: busca } },
        { processoNumero: { contains: busca } },
        { nomeCliente: { contains: busca } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (prioridade) {
      where.prioridade = prioridade
    }

    // Filtrar por próximos X dias
    if (proximosDias) {
      const dias = parseInt(proximosDias)
      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() + dias)
      where.dataVencimento = {
        lte: dataLimite,
        gte: new Date(),
      }
      where.status = { not: 'concluido' }
    }

    const [prazos, total] = await Promise.all([
      prisma.prazo.findMany({
        where,
        include: {
          pedido: {
            select: {
              id: true,
              titulo: true,
              tipoPeca: true,
            },
          },
        },
        orderBy: { dataVencimento: 'asc' },
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      prisma.prazo.count({ where }),
    ])

    // Estatísticas
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)
    const seteDias = new Date(hoje)
    seteDias.setDate(seteDias.getDate() + 7)

    const [
      vencidosCount,
      hojeCount,
      semanaCount,
      totalPendentes,
    ] = await Promise.all([
      prisma.prazo.count({
        where: {
          userId: session.user.id,
          status: { not: 'concluido' },
          dataVencimento: { lt: hoje },
        },
      }),
      prisma.prazo.count({
        where: {
          userId: session.user.id,
          status: { not: 'concluido' },
          dataVencimento: {
            gte: hoje,
            lt: amanha,
          },
        },
      }),
      prisma.prazo.count({
        where: {
          userId: session.user.id,
          status: { not: 'concluido' },
          dataVencimento: {
            gte: hoje,
            lt: seteDias,
          },
        },
      }),
      prisma.prazo.count({
        where: {
          userId: session.user.id,
          status: { not: 'concluido' },
        },
      }),
    ])

    return NextResponse.json({
      prazos,
      total,
      paginas: Math.ceil(total / limite),
      paginaAtual: pagina,
      estatisticas: {
        vencidos: vencidosCount,
        hoje: hojeCount,
        semana: semanaCount,
        pendentes: totalPendentes,
      },
    })
  } catch (error) {
    console.error('Erro ao listar prazos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo prazo
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const data = createPrazoSchema.parse(body)

    const prazo = await prisma.prazo.create({
      data: {
        titulo: data.titulo,
        descricao: data.descricao,
        dataVencimento: new Date(data.dataVencimento),
        tipo: data.tipo,
        prioridade: data.prioridade,
        processoNumero: data.processoNumero,
        nomeCliente: data.nomeCliente,
        pedidoId: data.pedidoId,
        lembrete: data.lembrete || false,
        diasLembrete: data.diasLembrete || 3,
        status: 'pendente',
        userId: session.user.id,
      },
    })

    return NextResponse.json(prazo, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Erro ao criar prazo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
