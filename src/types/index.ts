// ==================== TIPOS DE PEÇA ====================

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

export const TIPOS_PECA: { value: TipoPeca; label: string; descricao: string }[] = [
  { value: 'peticao_inicial', label: 'Petição Inicial', descricao: 'Documento que inicia um processo judicial' },
  { value: 'contestacao', label: 'Contestação', descricao: 'Resposta do réu à petição inicial' },
  { value: 'replica', label: 'Réplica', descricao: 'Resposta do autor à contestação' },
  { value: 'recurso_apelacao', label: 'Recurso de Apelação', descricao: 'Recurso contra sentença de primeiro grau' },
  { value: 'agravo_instrumento', label: 'Agravo de Instrumento', descricao: 'Recurso contra decisões interlocutórias' },
  { value: 'embargos_declaracao', label: 'Embargos de Declaração', descricao: 'Pedido de esclarecimento de decisão' },
  { value: 'habeas_corpus', label: 'Habeas Corpus', descricao: 'Proteção ao direito de locomoção' },
  { value: 'mandado_seguranca', label: 'Mandado de Segurança', descricao: 'Proteção de direito líquido e certo' },
  { value: 'parecer', label: 'Parecer Jurídico', descricao: 'Opinião técnica sobre questão jurídica' },
  { value: 'contrato', label: 'Contrato', descricao: 'Instrumento de acordo entre partes' },
  { value: 'notificacao_extrajudicial', label: 'Notificação Extrajudicial', descricao: 'Comunicação formal fora do processo' },
  { value: 'procuracao', label: 'Procuração', descricao: 'Instrumento de mandato' },
  { value: 'outro', label: 'Outro', descricao: 'Outro tipo de documento jurídico' },
]

// ==================== STATUS ====================

export type StatusPedido = 'pendente' | 'processando' | 'concluido' | 'erro'

export const STATUS_PEDIDO: { value: StatusPedido; label: string; color: string; bgColor: string }[] = [
  { value: 'pendente', label: 'Pendente', color: 'text-yellow-400', bgColor: 'bg-yellow-400' },
  { value: 'processando', label: 'Processando', color: 'text-blue-400', bgColor: 'bg-blue-400' },
  { value: 'concluido', label: 'Concluído', color: 'text-green-400', bgColor: 'bg-green-400' },
  { value: 'erro', label: 'Erro', color: 'text-red-400', bgColor: 'bg-red-400' },
]

export type StatusPrazo = 'pendente' | 'concluido' | 'vencido'

export const STATUS_PRAZO: { value: StatusPrazo; label: string; color: string }[] = [
  { value: 'pendente', label: 'Pendente', color: 'text-yellow-400' },
  { value: 'concluido', label: 'Concluído', color: 'text-green-400' },
  { value: 'vencido', label: 'Vencido', color: 'text-red-400' },
]

// ==================== ÁREAS DO DIREITO ====================

export type AreaDireito =
  | 'civil'
  | 'trabalhista'
  | 'penal'
  | 'tributario'
  | 'administrativo'
  | 'constitucional'
  | 'empresarial'
  | 'consumidor'
  | 'familia'
  | 'ambiental'
  | 'previdenciario'
  | 'outro'

export const AREAS_DIREITO: { value: AreaDireito; label: string }[] = [
  { value: 'civil', label: 'Civil' },
  { value: 'trabalhista', label: 'Trabalhista' },
  { value: 'penal', label: 'Penal' },
  { value: 'tributario', label: 'Tributário' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'constitucional', label: 'Constitucional' },
  { value: 'empresarial', label: 'Empresarial' },
  { value: 'consumidor', label: 'Consumidor' },
  { value: 'familia', label: 'Família' },
  { value: 'ambiental', label: 'Ambiental' },
  { value: 'previdenciario', label: 'Previdenciário' },
  { value: 'outro', label: 'Outro' },
]

// ==================== PRIORIDADES ====================

export type Prioridade = 'baixa' | 'media' | 'alta' | 'urgente'

export const PRIORIDADES: { value: Prioridade; label: string; color: string }[] = [
  { value: 'baixa', label: 'Baixa', color: 'text-gray-400' },
  { value: 'media', label: 'Média', color: 'text-blue-400' },
  { value: 'alta', label: 'Alta', color: 'text-orange-400' },
  { value: 'urgente', label: 'Urgente', color: 'text-red-400' },
]

// ==================== TIPOS DE PRAZO ====================

export type TipoPrazo = 'processual' | 'interno' | 'audiencia' | 'pericia'

export const TIPOS_PRAZO: { value: TipoPrazo; label: string }[] = [
  { value: 'processual', label: 'Processual' },
  { value: 'interno', label: 'Interno' },
  { value: 'audiencia', label: 'Audiência' },
  { value: 'pericia', label: 'Perícia' },
]

// ==================== PLANOS ====================

export type Plano = 'free' | 'pro' | 'enterprise'

export const PLANOS: { value: Plano; label: string; preco: number; recursos: string[] }[] = [
  {
    value: 'free',
    label: 'Gratuito',
    preco: 0,
    recursos: ['10 pedidos/mês', '1 usuário', '10MB por arquivo', 'Suporte por email'],
  },
  {
    value: 'pro',
    label: 'Profissional',
    preco: 149,
    recursos: ['100 pedidos/mês', '5 usuários', '150MB por arquivo', 'Suporte prioritário', 'Biblioteca de teses', 'Exportação DOCX/PDF'],
  },
  {
    value: 'enterprise',
    label: 'Empresarial',
    preco: 499,
    recursos: ['Pedidos ilimitados', 'Usuários ilimitados', '500MB por arquivo', 'Suporte 24/7', 'API personalizada', 'Treinamento'],
  },
]

// ==================== ROLES ====================

export type Role = 'admin' | 'advogado' | 'estagiario'

export const ROLES: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'advogado', label: 'Advogado' },
  { value: 'estagiario', label: 'Estagiário' },
]

// ==================== TEMAS ====================

export type Tema = 'dark' | 'light' | 'system'

export const TEMAS: { value: Tema; label: string }[] = [
  { value: 'dark', label: 'Escuro' },
  { value: 'light', label: 'Claro' },
  { value: 'system', label: 'Sistema' },
]

// ==================== FONTES ====================

export const FONTES: { value: string; label: string }[] = [
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Calibri', label: 'Calibri' },
  { value: 'Garamond', label: 'Garamond' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Courier New', label: 'Courier New' },
]

export const TAMANHOS_FONTE: { value: number; label: string }[] = [
  { value: 10, label: '10pt' },
  { value: 11, label: '11pt' },
  { value: 12, label: '12pt' },
  { value: 13, label: '13pt' },
  { value: 14, label: '14pt' },
]

export const ESPACAMENTOS_LINHA: { value: number; label: string }[] = [
  { value: 1.0, label: 'Simples (1.0)' },
  { value: 1.15, label: '1.15' },
  { value: 1.5, label: '1.5' },
  { value: 2.0, label: 'Duplo (2.0)' },
]

export const ALINHAMENTOS: { value: string; label: string }[] = [
  { value: 'left', label: 'Esquerda' },
  { value: 'center', label: 'Centro' },
  { value: 'right', label: 'Direita' },
  { value: 'justify', label: 'Justificado' },
]

// ==================== INTERFACES ====================

export interface PedidoFormData {
  titulo?: string
  tipoPeca: TipoPeca
  nomeCliente: string
  processoNumero?: string
  vara?: string
  tribunal?: string
  comarca?: string
  parteAutora?: string
  parteRe?: string
  observacoes?: string
  mostrarInfoProcesso?: boolean
}

export interface MensagemChat {
  id: string
  conteudo: string
  remetente: 'usuario' | 'sistema'
  createdAt: Date
}

export interface UserConfigData {
  fontFamily: string
  fontSize: number
  lineHeight: number
  marginTop: number
  marginBottom: number
  marginLeft: number
  marginRight: number
  textAlign: string
  paragraphIndent: number
  cabecalhoAtivo: boolean
  cabecalhoTexto?: string
  cabecalhoLogo?: string
  cabecalhoAlign: string
  rodapeAtivo: boolean
  rodapeTexto?: string
  rodapeIncluirPagina: boolean
  rodapeAlign: string
  assinaturaTexto?: string
  assinaturaOAB?: string
  assinaturaCidade?: string
  modeloBaseUrl?: string
}

export interface TeseFormData {
  titulo: string
  conteudo: string
  areaDireito: AreaDireito
  palavrasChave?: string
  fonte?: string
}

export interface PrazoFormData {
  titulo: string
  descricao?: string
  dataVencimento: Date
  tipo: TipoPrazo
  prioridade: Prioridade
  alertaEmail: boolean
  alertaWhatsapp: boolean
  diasAntecedencia: number
  pedidoId?: string
}

export interface PastaFormData {
  nome: string
  cor: string
  icone: string
  pastaParentId?: string
}

export interface TagFormData {
  nome: string
  cor: string
}

export interface EstatisticasDashboard {
  pedidosTotais: number
  pedidosMes: number
  pedidosConcluidos: number
  pedidosPendentes: number
  tempoMedioProcessamento: number
  documentosUpload: number
  tesesTotais: number
  prazosPendentes: number
  prazosVencidos: number
}

// ==================== TIPOS DE NOTIFICAÇÃO ====================

export type TipoNotificacao =
  | 'pedido_concluido'
  | 'pedido_erro'
  | 'prazo_vencendo'
  | 'prazo_vencido'
  | 'comentario'
  | 'sistema'

export const TIPOS_NOTIFICACAO: { value: TipoNotificacao; label: string; icone: string }[] = [
  { value: 'pedido_concluido', label: 'Pedido Concluído', icone: 'check-circle' },
  { value: 'pedido_erro', label: 'Erro no Pedido', icone: 'alert-circle' },
  { value: 'prazo_vencendo', label: 'Prazo Vencendo', icone: 'clock' },
  { value: 'prazo_vencido', label: 'Prazo Vencido', icone: 'alert-triangle' },
  { value: 'comentario', label: 'Novo Comentário', icone: 'message-circle' },
  { value: 'sistema', label: 'Sistema', icone: 'info' },
]

// ==================== CORES PARA TAGS/PASTAS ====================

export const CORES_DISPONIVEIS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#6b7280', // gray
]

// ==================== ÍCONES PARA PASTAS ====================

export const ICONES_PASTA = [
  'folder',
  'folder-open',
  'briefcase',
  'scale',
  'file-text',
  'users',
  'building',
  'home',
  'heart',
  'star',
]
