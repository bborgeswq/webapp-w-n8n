export type TipoPeca =
  | 'peticao_inicial'
  | 'contestacao'
  | 'replica'
  | 'recurso_apelacao'
  | 'agravo_instrumento'
  | 'embargos_declaracao'
  | 'habeas_corpus'
  | 'mandado_seguranca'
  | 'parecer'
  | 'contrato'
  | 'notificacao_extrajudicial'
  | 'procuracao'
  | 'outro'

export const TIPOS_PECA: { value: TipoPeca; label: string }[] = [
  { value: 'peticao_inicial', label: 'Petição Inicial' },
  { value: 'contestacao', label: 'Contestação' },
  { value: 'replica', label: 'Réplica' },
  { value: 'recurso_apelacao', label: 'Recurso de Apelação' },
  { value: 'agravo_instrumento', label: 'Agravo de Instrumento' },
  { value: 'embargos_declaracao', label: 'Embargos de Declaração' },
  { value: 'habeas_corpus', label: 'Habeas Corpus' },
  { value: 'mandado_seguranca', label: 'Mandado de Segurança' },
  { value: 'parecer', label: 'Parecer Jurídico' },
  { value: 'contrato', label: 'Contrato' },
  { value: 'notificacao_extrajudicial', label: 'Notificação Extrajudicial' },
  { value: 'procuracao', label: 'Procuração' },
  { value: 'outro', label: 'Outro' },
]

export type StatusPedido = 'pendente' | 'processando' | 'concluido' | 'erro'

export const STATUS_PEDIDO: { value: StatusPedido; label: string; color: string }[] = [
  { value: 'pendente', label: 'Pendente', color: 'bg-yellow-500' },
  { value: 'processando', label: 'Processando', color: 'bg-blue-500' },
  { value: 'concluido', label: 'Concluído', color: 'bg-green-500' },
  { value: 'erro', label: 'Erro', color: 'bg-red-500' },
]

export interface PedidoFormData {
  titulo: string
  tipoPeca: TipoPeca
  processoNumero?: string
  vara?: string
  parteAutora?: string
  parteRe?: string
  observacoes?: string
}

export interface MensagemChat {
  id: string
  conteudo: string
  remetente: 'usuario' | 'sistema'
  createdAt: Date
}
