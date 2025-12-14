import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const pedidoId = formData.get('pedidoId') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    // Verificar tamanho máximo (10MB)
    const maxSize = (parseInt(process.env.MAX_FILE_SIZE_MB || '10') || 10) * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo: 10MB' },
        { status: 400 }
      )
    }

    // Verificar tipos permitidos
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido' },
        { status: 400 }
      )
    }

    // Criar diretório de uploads se não existir
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    // Gerar nome único para o arquivo
    const fileExtension = path.extname(file.name)
    const uniqueFileName = `${uuidv4()}${fileExtension}`
    const filePath = path.join(uploadDir, uniqueFileName)

    // Salvar arquivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Criar registro no banco
    const documento = await prisma.documento.create({
      data: {
        nome: file.name,
        nomeArquivo: uniqueFileName,
        tipo: file.type,
        tamanho: file.size,
        caminho: `/uploads/${uniqueFileName}`,
        pedidoId: pedidoId || '',
      },
    })

    return NextResponse.json(documento, { status: 201 })
  } catch (error) {
    console.error('Erro ao fazer upload:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
