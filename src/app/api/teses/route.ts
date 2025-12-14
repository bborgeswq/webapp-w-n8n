import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const createTeseSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  descricao: z.string().optional(),
  conteudo: z.string().min(10, 'Conteúdo deve ter pelo menos 10 caracteres'),
  areaDireito: z.string(),
  tags: z.array(z.string()).optional(),
  fontes: z.string().optional(),
  favorito: z.boolean().optional(),
})

// GET - Listar teses
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const busca = searchParams.get('busca')
    const areaDireito = searchParams.get('areaDireito')
    const favoritos = searchParams.get('favoritos') === 'true'
    const limite = parseInt(searchParams.get('limite') || '50')
    const pagina = parseInt(searchParams.get('pagina') || '1')

    const where: any = { userId: session.user.id }

    if (busca) {
      where.OR = [
        { titulo: { contains: busca } },
        { descricao: { contains: busca } },
        { conteudo: { contains: busca } },
        { tags: { contains: busca } },
      ]
    }

    if (areaDireito) {
      where.areaDireito = areaDireito
    }

    if (favoritos) {
      where.favorito = true
    }

    const [teses, total] = await Promise.all([
      prisma.tese.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      prisma.tese.count({ where }),
    ])

    return NextResponse.json({
      teses,
      total,
      paginas: Math.ceil(total / limite),
      paginaAtual: pagina,
    })
  } catch (error) {
    console.error('Erro ao listar teses:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova tese
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const data = createTeseSchema.parse(body)

    const tese = await prisma.tese.create({
      data: {
        titulo: data.titulo,
        descricao: data.descricao,
        conteudo: data.conteudo,
        areaDireito: data.areaDireito,
        tags: data.tags?.join(',') || '',
        fontes: data.fontes,
        favorito: data.favorito || false,
        userId: session.user.id,
      },
    })

    return NextResponse.json(tese, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Erro ao criar tese:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
