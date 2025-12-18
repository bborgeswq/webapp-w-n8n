import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// Configuração para App Router - permitir uploads grandes (150MB)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  console.log('=== API UPLOAD: Requisição recebida ===')

  try {
    const session = await getServerSession(authOptions)
    console.log('Sessão:', session?.user?.id ? 'Autenticado' : 'Não autenticado')

    if (!session?.user?.id) {
      console.log('Erro: Usuário não autenticado')
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    let formData
    try {
      formData = await request.formData()
      console.log('FormData recebido com sucesso')
    } catch (formError) {
      console.error('Erro ao processar FormData:', formError)
      return NextResponse.json(
        { error: 'Erro ao processar dados do formulário' },
        { status: 400 }
      )
    }

    const file = formData.get('file') as File | null
    const pedidoId = formData.get('pedidoId') as string | null

    console.log('Arquivo recebido:', file ? `${file.name} (${file.size} bytes)` : 'null')
    console.log('PedidoId:', pedidoId || 'null')

    if (!file) {
      console.log('Erro: Nenhum arquivo enviado')
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
    const isAllowedType = file.type && allowedTypes.includes(file.type)
    const isAllowedExtension = allowedExtensions.includes(fileExtension)

    // Permitir se o tipo OU a extensão forem válidos (mais permissivo)
    if (!isAllowedType && !isAllowedExtension) {
      console.log('Arquivo rejeitado:', { name: file.name, type: file.type, extension: fileExtension })
      return NextResponse.json(
        { error: `Tipo de arquivo não permitido (${file.type || 'desconhecido'}). Use PDF, DOC, DOCX, imagens ou ZIP.` },
        { status: 400 }
      )
    }

    console.log('Arquivo aceito:', { name: file.name, type: file.type, extension: fileExtension, size: file.size })

    // Criar diretório de uploads se não existir
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    console.log('Diretório de uploads:', uploadDir)

    try {
      await mkdir(uploadDir, { recursive: true })
      console.log('Diretório criado/verificado com sucesso')
    } catch (mkdirError) {
      console.error('Erro ao criar diretório:', mkdirError)
      return NextResponse.json(
        { error: 'Erro ao criar diretório de uploads' },
        { status: 500 }
      )
    }

    // Gerar nome único para o arquivo
    const uniqueFileName = `${uuidv4()}${fileExtension}`
    const filePath = path.join(uploadDir, uniqueFileName)
    console.log('Caminho do arquivo:', filePath)

    // Salvar arquivo
    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)
      console.log('Arquivo salvo com sucesso no disco')
    } catch (writeError) {
      console.error('Erro ao salvar arquivo:', writeError)
      return NextResponse.json(
        { error: 'Erro ao salvar arquivo no servidor' },
        { status: 500 }
      )
    }

    // Criar registro no banco (pedidoId é opcional - será vinculado depois)
    try {
      const documento = await prisma.documento.create({
        data: {
          nome: file.name,
          nomeArquivo: uniqueFileName,
          tipo: file.type || 'application/octet-stream',
          tamanho: file.size,
          caminho: `/uploads/${uniqueFileName}`,
          pedidoId: pedidoId || null,
        },
      })
      console.log('Documento criado no banco:', documento.id)
      return NextResponse.json(documento, { status: 201 })
    } catch (dbError) {
      console.error('Erro ao salvar no banco:', dbError)
      return NextResponse.json(
        { error: 'Erro ao salvar documento no banco de dados' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erro ao fazer upload:', error)

    // Retornar mensagem de erro mais específica
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'

    // Verificar se é erro do Prisma
    if (errorMessage.includes('prisma') || errorMessage.includes('database')) {
      return NextResponse.json(
        { error: 'Erro ao salvar no banco de dados. Verifique a conexão.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: `Erro interno do servidor: ${errorMessage}` },
      { status: 500 }
    )
  }
}
