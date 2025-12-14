import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

// POST - Enviar pedido para processamento no N8N
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
      include: {
        documentos: true,
        user: {
          select: {
            name: true,
            email: true,
            oab: true,
          },
        },
      },
    })

    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    if (pedido.status !== 'pendente') {
      return NextResponse.json(
        { error: 'Pedido já foi processado' },
        { status: 400 }
      )
    }

    // Atualizar status para processando
    await prisma.pedido.update({
      where: { id: params.id },
      data: { status: 'processando' },
    })

    // Preparar dados dos documentos (ler conteúdo dos arquivos se necessário)
    const documentosData = pedido.documentos.map((doc) => ({
      id: doc.id,
      nome: doc.nome,
      tipo: doc.tipo,
      tamanho: doc.tamanho,
      caminho: doc.caminho,
    }))

    // Enviar para o N8N webhook
    const webhookUrl = process.env.N8N_WEBHOOK_URL

    if (!webhookUrl) {
      // Se não há webhook configurado, simular processamento
      console.log('N8N Webhook não configurado. Simulando processamento...')

      // Simular um delay e gerar uma peça mock
      setTimeout(async () => {
        const pecaMock = gerarPecaMock(pedido)
        await prisma.pedido.update({
          where: { id: params.id },
          data: {
            status: 'concluido',
            pecaGerada: pecaMock,
          },
        })
      }, 3000)

      return NextResponse.json({
        message: 'Pedido enviado para processamento (modo simulado)',
        pedidoId: pedido.id,
      })
    }

    // Enviar dados para o N8N
    const payload = {
      tipo: 'novo_pedido',
      pedidoId: pedido.id,
      titulo: pedido.titulo,
      tipoPeca: pedido.tipoPeca,
      processoNumero: pedido.processoNumero,
      vara: pedido.vara,
      parteAutora: pedido.parteAutora,
      parteRe: pedido.parteRe,
      observacoes: pedido.observacoes,
      advogado: pedido.user,
      documentos: documentosData,
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/webhook/n8n-response`,
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET || '',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Erro do N8N:', errorText)

        await prisma.pedido.update({
          where: { id: params.id },
          data: { status: 'erro' },
        })

        return NextResponse.json(
          { error: 'Erro ao processar pedido no N8N' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Pedido enviado para processamento',
        pedidoId: pedido.id,
      })
    } catch (fetchError) {
      console.error('Erro ao conectar com N8N:', fetchError)

      await prisma.pedido.update({
        where: { id: params.id },
        data: { status: 'erro' },
      })

      return NextResponse.json(
        { error: 'Erro ao conectar com o servidor de processamento' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erro ao processar pedido:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função para gerar peça mock quando N8N não está configurado
function gerarPecaMock(pedido: any) {
  const tiposPeca: Record<string, string> = {
    peticao_inicial: 'PETIÇÃO INICIAL',
    contestacao: 'CONTESTAÇÃO',
    replica: 'RÉPLICA',
    recurso_apelacao: 'RECURSO DE APELAÇÃO',
    agravo_instrumento: 'AGRAVO DE INSTRUMENTO',
    embargos_declaracao: 'EMBARGOS DE DECLARAÇÃO',
    habeas_corpus: 'HABEAS CORPUS',
    mandado_seguranca: 'MANDADO DE SEGURANÇA',
    parecer: 'PARECER JURÍDICO',
    contrato: 'CONTRATO',
    notificacao_extrajudicial: 'NOTIFICAÇÃO EXTRAJUDICIAL',
    procuracao: 'PROCURAÇÃO',
    outro: 'DOCUMENTO JURÍDICO',
  }

  const nomePeca = tiposPeca[pedido.tipoPeca] || 'DOCUMENTO JURÍDICO'

  return `# ${nomePeca}

**Processo nº:** ${pedido.processoNumero || 'A definir'}
**Vara:** ${pedido.vara || 'A definir'}

---

## EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA ${pedido.vara || 'VARA COMPETENTE'}

**${pedido.parteAutora || 'REQUERENTE'}**, já qualificado(a) nos autos em epígrafe, vem, respeitosamente, à presença de Vossa Excelência, por seu advogado que esta subscreve, expor e requerer o que segue:

---

## DOS FATOS

${pedido.observacoes || 'Os fatos serão descritos conforme documentação anexa.'}

---

## DO DIREITO

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

---

## DOS PEDIDOS

Ante o exposto, requer:

1. A procedência total dos pedidos formulados;
2. A condenação da parte adversa nas custas processuais e honorários advocatícios;
3. A produção de todas as provas admitidas em direito.

Termos em que,
Pede deferimento.

${new Date().toLocaleDateString('pt-BR')}

---

**[Nome do Advogado]**
OAB/XX nº XXXXX

---

*Esta é uma peça modelo gerada automaticamente. Configure o webhook do N8N para geração real com IA.*
`
}
