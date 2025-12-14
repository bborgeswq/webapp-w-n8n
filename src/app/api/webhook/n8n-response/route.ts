import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST - Receber resposta do N8N com a peça gerada
export async function POST(request: Request) {
  try {
    // Verificar secret do webhook
    const webhookSecret = request.headers.get('X-Webhook-Secret')
    const expectedSecret = process.env.N8N_WEBHOOK_SECRET

    if (expectedSecret && webhookSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { pedidoId, pecaGerada, tipo, mensagem, erro } = body

    if (!pedidoId) {
      return NextResponse.json(
        { error: 'pedidoId é obrigatório' },
        { status: 400 }
      )
    }

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
    })

    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    // Se for erro
    if (erro) {
      await prisma.pedido.update({
        where: { id: pedidoId },
        data: { status: 'erro' },
      })

      // Criar mensagem de erro
      await prisma.mensagem.create({
        data: {
          conteudo: `Erro ao processar: ${erro}`,
          remetente: 'sistema',
          pedidoId,
        },
      })

      return NextResponse.json({ message: 'Erro registrado' })
    }

    // Se for ajuste (resposta a uma mensagem)
    if (tipo === 'ajuste' && mensagem) {
      // Atualizar peça com ajuste
      if (pecaGerada) {
        await prisma.pedido.update({
          where: { id: pedidoId },
          data: { pecaGerada },
        })
      }

      // Criar mensagem de resposta
      await prisma.mensagem.create({
        data: {
          conteudo: mensagem,
          remetente: 'sistema',
          pedidoId,
        },
      })

      return NextResponse.json({ message: 'Ajuste processado' })
    }

    // Se for novo pedido
    if (pecaGerada) {
      await prisma.pedido.update({
        where: { id: pedidoId },
        data: {
          pecaGerada,
          status: 'concluido',
        },
      })

      // Criar mensagem de conclusão
      await prisma.mensagem.create({
        data: {
          conteudo: 'Peça jurídica gerada com sucesso! Revise o documento e confirme quando estiver satisfeito.',
          remetente: 'sistema',
          pedidoId,
        },
      })

      return NextResponse.json({ message: 'Peça gerada com sucesso' })
    }

    return NextResponse.json(
      { error: 'Dados inválidos' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
