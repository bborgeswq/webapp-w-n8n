'use client'

import { User, Bot } from 'lucide-react'
import { cn, formatDateTime } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

interface ChatMessageProps {
  conteudo: string
  remetente: 'usuario' | 'sistema'
  createdAt: Date | string
}

export function ChatMessage({ conteudo, remetente, createdAt }: ChatMessageProps) {
  const isUser = remetente === 'usuario'

  return (
    <div
      className={cn(
        'flex gap-3 p-4',
        isUser ? 'bg-dark-800/50' : 'bg-dark-900'
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isUser ? 'bg-primary-600' : 'bg-dark-700'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-primary-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-white">
            {isUser ? 'Você' : 'JurisAI'}
          </span>
          <span className="text-xs text-dark-500">
            {formatDateTime(createdAt)}
          </span>
        </div>
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{conteudo}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
