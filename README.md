# JurisAI - Assistente Jurídico Inteligente

Sistema de criação de peças jurídicas com inteligência artificial, integrado com N8N para processamento RAG.

## Funcionalidades

- **Autenticação completa** (login/registro)
- **Criação de pedidos** com formulário estruturado
- **Upload de documentos** (PDF, DOC, DOCX, TXT, imagens)
- **Integração com N8N** via webhook
- **Chat para ajustes** após geração da peça
- **Histórico de pedidos** na sidebar
- **Interface moderna** estilo ChatGPT

## Stack Tecnológica

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Estilização**: TailwindCSS
- **Banco de dados**: SQLite (dev) / PostgreSQL (produção)
- **ORM**: Prisma
- **Autenticação**: NextAuth.js
- **Formulários**: React Hook Form + Zod

## Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
# Database (SQLite para desenvolvimento)
DATABASE_URL="file:./dev.db"

# NextAuth (gere uma chave segura para produção)
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"

# N8N Webhook (configure com suas URLs)
N8N_WEBHOOK_URL="https://seu-n8n.com/webhook/processar-pedido"
N8N_WEBHOOK_SECRET="sua-chave-webhook"
```

### 3. Configurar banco de dados

```bash
# Gerar cliente Prisma
npx prisma generate

# Criar tabelas no banco
npx prisma db push
```

### 4. Executar em desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/           # Páginas de autenticação
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/      # Páginas protegidas
│   │   ├── novo-pedido/
│   │   └── pedidos/[id]/
│   └── api/              # Rotas da API
│       ├── auth/
│       ├── pedidos/
│       ├── upload/
│       └── webhook/
├── components/
│   ├── ui/               # Componentes de UI reutilizáveis
│   ├── layout/           # Sidebar, Header, etc
│   ├── forms/            # FileUpload, etc
│   └── chat/             # Componentes de chat
├── lib/                  # Utilitários e configurações
├── types/                # Tipos TypeScript
└── hooks/                # Custom hooks
```

## Integração com N8N

### Webhook de entrada (seu sistema → N8N)

Quando um novo pedido é criado, o sistema envia para o webhook configurado:

```json
{
  "tipo": "novo_pedido",
  "pedidoId": "cuid123",
  "titulo": "Petição Inicial",
  "tipoPeca": "peticao_inicial",
  "processoNumero": "0000000-00.0000.0.00.0000",
  "vara": "1ª Vara Cível",
  "parteAutora": "João Silva",
  "parteRe": "Empresa XYZ",
  "observacoes": "Argumentos específicos...",
  "advogado": {
    "name": "Dr. Advogado",
    "email": "adv@email.com",
    "oab": "OAB/SP 123456"
  },
  "documentos": [
    {
      "id": "doc123",
      "nome": "contrato.pdf",
      "tipo": "application/pdf",
      "caminho": "/uploads/uuid.pdf"
    }
  ],
  "callbackUrl": "https://seu-site.com/api/webhook/n8n-response"
}
```

### Webhook de resposta (N8N → seu sistema)

O N8N deve enviar a resposta para `/api/webhook/n8n-response`:

```json
{
  "pedidoId": "cuid123",
  "pecaGerada": "# PETIÇÃO INICIAL\n\nConteúdo da peça em Markdown...",
  "tipo": "novo_pedido"
}
```

Para ajustes via chat:

```json
{
  "pedidoId": "cuid123",
  "pecaGerada": "# PETIÇÃO ATUALIZADA\n\nConteúdo atualizado...",
  "mensagem": "Ajustei conforme solicitado...",
  "tipo": "ajuste"
}
```

### Headers necessários

```
Content-Type: application/json
X-Webhook-Secret: sua-chave-configurada-em-N8N_WEBHOOK_SECRET
```

## Deploy em Produção

### Opção 1: Vercel (Recomendado)

1. Faça push do código para o GitHub
2. Conecte o repositório na Vercel
3. Configure as variáveis de ambiente
4. Use PostgreSQL (ex: Supabase, Railway, Neon)

### Opção 2: VPS/Servidor próprio

1. Clone o repositório no servidor
2. Configure PostgreSQL
3. Atualize `.env` com `DATABASE_URL` do PostgreSQL
4. Execute:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

### Migrar de SQLite para PostgreSQL

1. Atualize `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Atualize `DATABASE_URL` no `.env`:

```env
DATABASE_URL="postgresql://user:pass@host:5432/jurisai"
```

3. Execute as migrações:

```bash
npx prisma migrate dev --name init
```

## Tipos de Peças Disponíveis

- Petição Inicial
- Contestação
- Réplica
- Recurso de Apelação
- Agravo de Instrumento
- Embargos de Declaração
- Habeas Corpus
- Mandado de Segurança
- Parecer Jurídico
- Contrato
- Notificação Extrajudicial
- Procuração

## Licença

MIT
