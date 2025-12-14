import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET - Obter estatísticas do dashboard
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = session.user.id

    // Buscar todas as estatísticas em paralelo
    const [
      totalPedidos,
      pedidosPendentes,
      pedidosEmProcessamento,
      pedidosConcluidos,
      pedidosUltimos30Dias,
      pedidosPorTipo,
      pedidosRecentes,
      totalDocumentos,
    ] = await Promise.all([
      // Total de pedidos
      prisma.pedido.count({ where: { userId } }),

      // Pedidos pendentes
      prisma.pedido.count({ where: { userId, status: 'pendente' } }),

      // Pedidos em processamento
      prisma.pedido.count({ where: { userId, status: 'processando' } }),

      // Pedidos concluídos
      prisma.pedido.count({ where: { userId, status: 'concluido' } }),

      // Pedidos nos últimos 30 dias
      prisma.pedido.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Pedidos agrupados por tipo de peça
      prisma.pedido.groupBy({
        by: ['tipoPeca'],
        where: { userId },
        _count: { tipoPeca: true },
        orderBy: { _count: { tipoPeca: 'desc' } },
        take: 5,
      }),

      // Pedidos recentes
      prisma.pedido.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          titulo: true,
          tipoPeca: true,
          status: true,
          createdAt: true,
          nomeCliente: true,
        },
      }),

      // Total de documentos
      prisma.documento.count({
        where: {
          pedido: { userId },
        },
      }),
    ])

    // Calcular estatísticas por período
    const hoje = new Date()
    const inicioSemana = new Date(hoje)
    inicioSemana.setDate(hoje.getDate() - hoje.getDay())
    inicioSemana.setHours(0, 0, 0, 0)

    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

    const [pedidosSemana, pedidosMes] = await Promise.all([
      prisma.pedido.count({
        where: {
          userId,
          createdAt: { gte: inicioSemana },
        },
      }),
      prisma.pedido.count({
        where: {
          userId,
          createdAt: { gte: inicioMes },
        },
      }),
    ])

    // Calcular tendência (comparar com período anterior)
    const periodoAnterior = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    const meioDoPerodo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const pedidosPeriodoAnterior = await prisma.pedido.count({
      where: {
        userId,
        createdAt: {
          gte: periodoAnterior,
          lt: meioDoPerodo,
        },
      },
    })

    const tendencia = pedidosPeriodoAnterior > 0
      ? Math.round(((pedidosUltimos30Dias - pedidosPeriodoAnterior) / pedidosPeriodoAnterior) * 100)
      : pedidosUltimos30Dias > 0 ? 100 : 0

    return NextResponse.json({
      estatisticas: {
        totalPedidos,
        pedidosPendentes,
        pedidosEmProcessamento,
        pedidosConcluidos,
        pedidosUltimos30Dias,
        pedidosSemana,
        pedidosMes,
        totalDocumentos,
        tendencia,
      },
      pedidosPorTipo: pedidosPorTipo.map(p => ({
        tipo: p.tipoPeca,
        quantidade: p._count.tipoPeca,
      })),
      pedidosRecentes,
    })
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
