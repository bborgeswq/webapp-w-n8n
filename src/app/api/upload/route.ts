import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// Configuração para permitir uploads grandes
export const config = {
  api: {
    bodyParser: false,
  },
}

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

    // Verificar tamanho máximo (150MB padrão, configurável)
    const maxSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || '150') || 150
    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Arquivo muito grande. Máximo: ${maxSizeMB}MB` },
        { status: 400 }
      )
    }

    // Verificar tipos permitidos (ampliado para processos jurídicos)
    const allowedTypes = [
      // Documentos
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.oasis.opendocument.text',
      'application/rtf',
      'text/plain',
      'text/rtf',
      // Planilhas
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      // Imagens
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/tiff',
      // Compactados (para múltiplos documentos)
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
    ]

    // Verificar também por extensão
    const allowedExtensions = [
      '.pdf', '.doc', '.docx', '.odt', '.rtf', '.txt',
      '.xls', '.xlsx',
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff',
      '.zip', '.rar'
    ]

    const fileExtension = path.extname(file.name).toLowerCase()
    const isAllowedType = allowedTypes.includes(file.type)
    const isAllowedExtension = allowedExtensions.includes(fileExtension)

    if (!isAllowedType && !isAllowedExtension) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use PDF, DOC, DOCX, imagens ou ZIP.' },
        { status: 400 }
      )
    }

    // Criar diretório de uploads se não existir
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    // Gerar nome único para o arquivo
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
        tipo: file.type || 'application/octet-stream',
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
