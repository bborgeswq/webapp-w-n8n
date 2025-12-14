#!/bin/bash

echo "🏛️  JurisAI - Setup Script"
echo "=========================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js 18+ primeiro."
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js encontrado: $(node -v)"

# Instalar dependências
echo ""
echo "📦 Instalando dependências..."
npm install

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 Criando arquivo .env..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Configure o arquivo .env com suas credenciais${NC}"
fi

# Gerar Prisma Client
echo ""
echo "🗄️  Configurando banco de dados..."
npx prisma generate

# Criar tabelas
echo ""
echo "📊 Criando tabelas no banco..."
npx prisma db push

# Sucesso
echo ""
echo -e "${GREEN}✅ Setup concluído com sucesso!${NC}"
echo ""
echo "📌 Próximos passos:"
echo "   1. Configure o arquivo .env com suas credenciais"
echo "   2. Configure as URLs do webhook N8N"
echo "   3. Execute: npm run dev"
echo "   4. Acesse: http://localhost:3000"
echo ""
