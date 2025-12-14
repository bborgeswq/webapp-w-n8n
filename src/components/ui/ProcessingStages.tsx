'use client'

import { cn } from '@/lib/utils'
import {
  FileSearch,
  PenTool,
  CheckCircle2,
  FileText,
  Loader2,
  Clock,
} from 'lucide-react'

export interface ProcessingStage {
  id: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const STAGES: ProcessingStage[] = [
  {
    id: 'lendo',
    label: 'Lendo',
    description: 'Analisando documentos enviados',
    icon: FileSearch,
  },
  {
    id: 'escrevendo',
    label: 'Escrevendo',
    description: 'Gerando a peça jurídica',
    icon: PenTool,
  },
  {
    id: 'validando',
    label: 'Validando',
    description: 'Verificando consistência jurídica',
    icon: CheckCircle2,
  },
  {
    id: 'formatando',
    label: 'Formatando',
    description: 'Aplicando formatação final',
    icon: FileText,
  },
]

interface ProcessingStagesProps {
  currentStage: string
  progress?: number
  className?: string
}

export function ProcessingStages({
  currentStage,
  progress = 0,
  className,
}: ProcessingStagesProps) {
  const currentIndex = STAGES.findIndex((s) => s.id === currentStage)

  // Se estiver aguardando ou concluído, mostrar estado especial
  if (currentStage === 'aguardando') {
    return (
      <div className={cn('p-6 rounded-xl bg-dark-800/50 text-center', className)}>
        <Clock className="w-12 h-12 text-dark-400 mx-auto mb-3" />
        <p className="text-dark-300 font-medium">Aguardando processamento</p>
        <p className="text-sm text-dark-500 mt-1">
          Seu pedido está na fila e será processado em breve
        </p>
      </div>
    )
  }

  if (currentStage === 'concluido') {
    return (
      <div className={cn('p-6 rounded-xl bg-green-500/10 border border-green-500/30 text-center', className)}>
        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
        <p className="text-green-400 font-medium">Peça concluída!</p>
        <p className="text-sm text-dark-400 mt-1">
          Sua peça jurídica está pronta para revisão
        </p>
      </div>
    )
  }

  if (currentStage === 'erro') {
    return (
      <div className={cn('p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-center', className)}>
        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">!</span>
        </div>
        <p className="text-red-400 font-medium">Erro no processamento</p>
        <p className="text-sm text-dark-400 mt-1">
          Ocorreu um erro. Tente novamente ou entre em contato com o suporte.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('p-6 rounded-xl bg-dark-800/50', className)}>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-dark-400">Progresso</span>
          <span className="text-sm font-medium text-primary-400">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-dark-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stages */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-dark-700" />

        <div className="space-y-4 relative">
          {STAGES.map((stage, index) => {
            const isActive = stage.id === currentStage
            const isCompleted = index < currentIndex
            const isPending = index > currentIndex
            const Icon = stage.icon

            return (
              <div
                key={stage.id}
                className={cn(
                  'flex items-start gap-4 p-3 rounded-lg transition-all',
                  isActive && 'bg-primary-500/10'
                )}
              >
                {/* Icon Circle */}
                <div
                  className={cn(
                    'relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0',
                    isCompleted && 'bg-green-500/20',
                    isActive && 'bg-primary-500/20',
                    isPending && 'bg-dark-700'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  ) : isActive ? (
                    <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
                  ) : (
                    <Icon className={cn('w-6 h-6', isPending ? 'text-dark-500' : 'text-primary-400')} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-2">
                    <h4
                      className={cn(
                        'font-medium',
                        isCompleted && 'text-green-400',
                        isActive && 'text-primary-400',
                        isPending && 'text-dark-500'
                      )}
                    >
                      {stage.label}
                    </h4>
                    {isActive && (
                      <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full">
                        Em andamento
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                        Concluído
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      'text-sm mt-0.5',
                      isPending ? 'text-dark-600' : 'text-dark-400'
                    )}
                  >
                    {stage.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
