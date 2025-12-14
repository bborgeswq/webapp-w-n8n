import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET - Listar notificações
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const naoLidas = searchParams.get('naoLidas') === 'true'
    const limite = parseInt(searchParams.get('limite') || '20')
    const pagina = parseInt(searchParams.get('pagina') || '1')

    const where: any = { userId: session.user.id }

    if (naoLidas) {
      where.lida = false
    }

    const [notificacoes, total, naoLidasCount] = await Promise.all([
      prisma.notificacao.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      prisma.notificacao.count({ where }),
      prisma.notificacao.count({
        where: { userId: session.user.id, lida: false },
      }),
    ])

    return NextResponse.json({
      notificacoes,
      total,
      naoLidas: naoLidasCount,
      paginas: Math.ceil(total / limite),
      paginaAtual: pagina,
    })
  } catch (error) {
    console.error('Erro ao listar notificações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar notificação (usado internamente)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { titulo, mensagem, tipo, link, pedidoId, prazoId } = body

    const notificacao = await prisma.notificacao.create({
      data: {
        titulo,
        mensagem,
        tipo: tipo || 'info',
        link,
        pedidoId,
        prazoId,
        userId: session.user.id,
      },
    })

    return NextResponse.json(notificacao, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar notificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Marcar notificações como lidas
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { ids, marcarTodas } = body

    if (marcarTodas) {
      await prisma.notificacao.updateMany({
        where: { userId: session.user.id, lida: false },
        data: { lida: true },
      })
    } else if (ids && ids.length > 0) {
      await prisma.notificacao.updateMany({
        where: {
          id: { in: ids },
          userId: session.user.id,
        },
        data: { lida: true },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar notificações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir notificações
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const excluirTodas = searchParams.get('todas') === 'true'

    if (excluirTodas) {
      await prisma.notificacao.deleteMany({
        where: { userId: session.user.id },
      })
    } else if (id) {
      await prisma.notificacao.delete({
        where: { id, userId: session.user.id },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir notificações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
