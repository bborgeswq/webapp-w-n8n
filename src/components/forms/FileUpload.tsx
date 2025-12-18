'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText, Image, File } from 'lucide-react'
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
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao fazer upload')
      }

      return await response.json()
    } catch (err) {
      console.error('Erro no upload:', err)
      return null
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (files.length + acceptedFiles.length > maxFiles) {
        setError(`Máximo de ${maxFiles} arquivos permitidos`)
        return
      }

      setUploading(true)
      setError(null)

      const uploadedFiles: UploadedFile[] = []

      for (const file of acceptedFiles) {
        const result = await uploadFile(file)
        if (result) {
          uploadedFiles.push(result)
        }
      }

      const newFiles = [...files, ...uploadedFiles]
      setFiles(newFiles)
      onFilesChange(newFiles)
      setUploading(false)
    },
    [files, maxFiles, onFilesChange, pedidoId]
  )

  const removeFile = (fileId: string) => {
    const newFiles = files.filter((f) => f.id !== fileId)
    setFiles(newFiles)
    onFilesChange(newFiles)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
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
          uploading && 'opacity-50 cursor-not-allowed'
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
          <p className="text-primary-400 mt-2">Enviando arquivos...</p>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

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
                  onClick={() => removeFile(file.id)}
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
