'use client'

import { useCallback, useState } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { Upload, X, FileText, Image, File, AlertCircle } from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'
import { Button } from '@/components/ui'

interface UploadedFile {
  id: string
  nome: string
  tipo: string
  tamanho: number
  caminho: string
}

interface FileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void
  maxFiles?: number
  pedidoId?: string
}

export function FileUpload({ onFilesChange, maxFiles = 10, pedidoId }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    const formData = new FormData()
    formData.append('file', file)
    if (pedidoId) {
      formData.append('pedidoId', pedidoId)
    }

    try {
      console.log('=== INICIANDO UPLOAD ===')
      console.log('Nome:', file.name)
      console.log('Tipo MIME:', file.type || '(vazio)')
      console.log('Tamanho:', file.size, 'bytes')
      console.log('Extensão:', file.name.split('.').pop()?.toLowerCase())

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      console.log('Status da resposta:', response.status)

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error('Erro ao parsear JSON:', jsonError)
        throw new Error('Resposta inválida do servidor')
      }

      if (!response.ok) {
        console.error('Erro na resposta do servidor:', data)
        throw new Error(data.error || `Erro HTTP ${response.status}`)
      }

      console.log('=== UPLOAD CONCLUÍDO ===')
      console.log('Documento ID:', data.id)
      return data
    } catch (err) {
      console.error('=== ERRO NO UPLOAD ===')
      console.error('Detalhes:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(`Erro ao enviar ${file.name}: ${errorMessage}`)
      return null
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      console.log('Arquivos aceitos:', acceptedFiles.length)

      if (acceptedFiles.length === 0) {
        return
      }

      if (files.length + acceptedFiles.length > maxFiles) {
        setError(`Máximo de ${maxFiles} arquivos permitidos`)
        return
      }

      setUploading(true)
      setError(null)

      const uploadedFiles: UploadedFile[] = []
      const errors: string[] = []

      for (const file of acceptedFiles) {
        const result = await uploadFile(file)
        if (result) {
          uploadedFiles.push(result)
        } else {
          errors.push(file.name)
        }
      }

      if (errors.length > 0 && uploadedFiles.length === 0) {
        setError(`Falha ao enviar: ${errors.join(', ')}`)
      }

      const newFiles = [...files, ...uploadedFiles]
      setFiles(newFiles)
      onFilesChange(newFiles)
      setUploading(false)
    },
    [files, maxFiles, onFilesChange, pedidoId]
  )

  const onDropRejected = useCallback((rejectedFiles: FileRejection[]) => {
    console.log('Arquivos rejeitados:', rejectedFiles)

    const errorMessages = rejectedFiles.map((rejection) => {
      const fileName = rejection.file.name
      const errors = rejection.errors.map((e) => {
        switch (e.code) {
          case 'file-too-large':
            return `muito grande (máx. 150MB)`
          case 'file-invalid-type':
            return `tipo não permitido`
          default:
            return e.message
        }
      })
      return `${fileName}: ${errors.join(', ')}`
    })

    setError(errorMessages.join('; '))
  }, [])

  const removeFile = (fileId: string) => {
    const newFiles = files.filter((f) => f.id !== fileId)
    setFiles(newFiles)
    onFilesChange(newFiles)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.oasis.opendocument.text': ['.odt'],
      'application/rtf': ['.rtf'],
      'text/plain': ['.txt'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.tiff'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
    },
    maxSize: 150 * 1024 * 1024, // 150MB
    disabled: uploading,
    multiple: true,
  })

  const getFileIcon = (tipo: string) => {
    if (tipo.startsWith('image/')) return <Image className="w-5 h-5" />
    if (tipo.includes('pdf')) return <FileText className="w-5 h-5 text-red-400" />
    if (tipo.includes('word') || tipo.includes('document'))
      return <FileText className="w-5 h-5 text-blue-400" />
    return <File className="w-5 h-5" />
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary-500 bg-primary-500/10'
            : 'border-dark-600 hover:border-dark-500',
          uploading && 'opacity-50 cursor-not-allowed',
          error && 'border-red-500/50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-10 h-10 mx-auto text-dark-400 mb-3" />
        {isDragActive ? (
          <p className="text-primary-400">Solte os arquivos aqui...</p>
        ) : (
          <>
            <p className="text-dark-300 mb-1">
              Arraste e solte arquivos aqui, ou clique para selecionar
            </p>
            <p className="text-sm text-dark-500">
              PDF, DOC, DOCX, ODT, RTF, TXT, XLS, XLSX, imagens, ZIP, RAR (máx. 150MB cada)
            </p>
          </>
        )}
        {uploading && (
          <p className="text-primary-400 mt-2 animate-pulse">Enviando arquivos...</p>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-dark-400">
            {files.length} arquivo(s) anexado(s)
          </p>
          <ul className="space-y-2">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex items-center justify-between p-3 bg-dark-800 rounded-lg border border-dark-700"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(file.tipo)}
                  <div>
                    <p className="text-sm text-white truncate max-w-[200px] sm:max-w-[300px]">
                      {file.nome}
                    </p>
                    <p className="text-xs text-dark-400">
                      {formatFileSize(file.tamanho)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(file.id)
                  }}
                  className="text-dark-400 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
