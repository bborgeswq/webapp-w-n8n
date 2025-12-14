'use client'

import { useState, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled, placeholder = 'Digite sua mensagem...' }: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="p-4 border-t border-dark-800 bg-dark-900">
      <div className="flex gap-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none disabled:opacity-50"
          style={{ minHeight: '48px', maxHeight: '150px' }}
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="px-4"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
      <p className="text-xs text-dark-500 mt-2">
        Pressione Enter para enviar, Shift + Enter para nova linha
      </p>
    </div>
  )
}
