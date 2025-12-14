import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET - Obter pedido específico
export async function GET(
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
      include: {
        documentos: true,
        mensagens: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(pedido)
  } catch (error) {
    console.error('Erro ao obter pedido:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir pedido
export async function DELETE(
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

    await prisma.pedido.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Pedido excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir pedido:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
