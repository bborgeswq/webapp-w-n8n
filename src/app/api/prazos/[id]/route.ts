import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const updatePrazoSchema = z.object({
  titulo: z.string().min(3).optional(),
  descricao: z.string().optional(),
  dataVencimento: z.string().optional(),
  tipo: z.enum(['fatal', 'judicial', 'administrativo', 'interno', 'outros']).optional(),
  prioridade: z.enum(['baixa', 'media', 'alta', 'urgente']).optional(),
  status: z.enum(['pendente', 'em_andamento', 'concluido', 'cancelado']).optional(),
  processoNumero: z.string().optional(),
  nomeCliente: z.string().optional(),
  lembrete: z.boolean().optional(),
  diasLembrete: z.number().optional(),
})

// GET - Obter prazo específico
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const prazo = await prisma.prazo.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        pedido: {
          select: {
            id: true,
            titulo: true,
            tipoPeca: true,
          },
        },
      },
    })

    if (!prazo) {
      return NextResponse.json({ error: 'Prazo não encontrado' }, { status: 404 })
    }

    return NextResponse.json(prazo)
  } catch (error) {
    console.error('Erro ao obter prazo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar prazo
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const existingPrazo = await prisma.prazo.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingPrazo) {
      return NextResponse.json({ error: 'Prazo não encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const data = updatePrazoSchema.parse(body)

    const updateData: any = { ...data }
    if (data.dataVencimento) {
      updateData.dataVencimento = new Date(data.dataVencimento)
    }

    const prazo = await prisma.prazo.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(prazo)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar prazo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir prazo
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const prazo = await prisma.prazo.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!prazo) {
      return NextResponse.json({ error: 'Prazo não encontrado' }, { status: 404 })
    }

    await prisma.prazo.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Prazo excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir prazo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
