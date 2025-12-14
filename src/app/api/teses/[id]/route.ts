import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const updateTeseSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').optional(),
  descricao: z.string().optional(),
  conteudo: z.string().min(10, 'Conteúdo deve ter pelo menos 10 caracteres').optional(),
  areaDireito: z.string().optional(),
  tags: z.array(z.string()).optional(),
  fontes: z.string().optional(),
  favorito: z.boolean().optional(),
})

// GET - Obter tese específica
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

    const tese = await prisma.tese.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!tese) {
      return NextResponse.json({ error: 'Tese não encontrada' }, { status: 404 })
    }

    return NextResponse.json(tese)
  } catch (error) {
    console.error('Erro ao obter tese:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar tese
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

    // Verificar se a tese pertence ao usuário
    const existingTese = await prisma.tese.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingTese) {
      return NextResponse.json({ error: 'Tese não encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const data = updateTeseSchema.parse(body)

    const tese = await prisma.tese.update({
      where: { id },
      data: {
        ...data,
        tags: data.tags?.join(',') || existingTese.tags,
      },
    })

    return NextResponse.json(tese)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar tese:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir tese
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

    // Verificar se a tese pertence ao usuário
    const tese = await prisma.tese.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!tese) {
      return NextResponse.json({ error: 'Tese não encontrada' }, { status: 404 })
    }

    await prisma.tese.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Tese excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir tese:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
