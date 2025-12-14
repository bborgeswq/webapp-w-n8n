import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// POST - Confirmar que a peça está finalizada
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const pedido = await prisma.pedido.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    if (pedido.status !== 'concluido') {
      return NextResponse.json(
        { error: 'Pedido ainda não foi processado' },
        { status: 400 }
      )
    }

    const pedidoAtualizado = await prisma.pedido.update({
      where: { id: params.id },
      data: {
        confirmado: true,
        confirmadoEm: new Date(),
      },
    })

    return NextResponse.json(pedidoAtualizado)
  } catch (error) {
    console.error('Erro ao confirmar pedido:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
