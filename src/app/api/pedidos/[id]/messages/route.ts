import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const messageSchema = z.object({
  conteudo: z.string().min(1, 'Mensagem não pode estar vazia'),
})

// GET - Listar mensagens do pedido
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o pedido pertence ao usuário
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

    const mensagens = await prisma.mensagem.findMany({
      where: { pedidoId: params.id },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(mensagens)
  } catch (error) {
    console.error('Erro ao listar mensagens:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Enviar nova mensagem (ajuste na peça)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { conteudo } = messageSchema.parse(body)

    // Verificar se o pedido existe e está concluído
    const pedido = await prisma.pedido.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        documentos: true,
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

    // Criar mensagem do usuário
    const mensagemUsuario = await prisma.mensagem.create({
      data: {
        conteudo,
        remetente: 'usuario',
        pedidoId: params.id,
      },
    })

    // Enviar para o N8N para processamento de ajuste
    try {
      const webhookUrl = process.env.N8N_WEBHOOK_URL
      if (webhookUrl) {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET || '',
          },
          body: JSON.stringify({
            tipo: 'ajuste',
            pedidoId: pedido.id,
            mensagem: conteudo,
            pecaAtual: pedido.pecaGerada,
            contexto: {
              tipoPeca: pedido.tipoPeca,
              titulo: pedido.titulo,
            },
          }),
        })

        if (!response.ok) {
          console.error('Erro ao enviar para N8N:', await response.text())
        }
      }
    } catch (webhookError) {
      console.error('Erro ao enviar webhook:', webhookError)
    }

    return NextResponse.json(mensagemUsuario, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Erro ao enviar mensagem:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
