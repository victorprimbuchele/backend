## Backend

API em Node.js com Express, organizada em camadas (DDD): `domain`, `application`, `infrastructure`, `interfaces`.

### 🚀 Início Rápido com Docker

A forma mais simples de rodar a aplicação:

```bash
# Subir todos os serviços
docker-compose up

# Ou em modo detached (background)
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Parar os serviços
docker-compose down

# Parar e remover volumes (limpar banco)
docker-compose down -v
```

Isso irá:
- ✅ Subir o banco de dados PostgreSQL
- ✅ Aguardar o banco estar pronto (healthcheck)
- ✅ Executar as migrações automaticamente
- ✅ Popular o banco com dados de teste (seed)
- ✅ Iniciar a API em modo desenvolvimento (hot-reload)
- ✅ Verificar o healthcheck da API

A API estará disponível em `http://localhost:3001`

**Características do ambiente de desenvolvimento:**
- 🔄 Hot-reload: alterações no código são refletidas automaticamente
- 🌱 Seed automático: banco populado com dados de teste
- 🧪 Todas as dependências de desenvolvimento disponíveis

**Healthcheck**: Você pode verificar se a API está pronta acessando `http://localhost:3001/health`

### 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Arquivo `.env` configurado (veja `.env.example`)

### 🔧 Desenvolvimento Local

Se preferir rodar localmente sem Docker:

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Gerar Prisma Client
npm run prisma:generate

# Executar migrações
npm run prisma:migrate

# Rodar em modo desenvolvimento
npm run dev
```

### 🧪 Testes

```bash
# Rodar testes
npm test

# Rodar testes com coverage
npm test -- --coverage
```

### 📝 Scripts Disponíveis

- `npm run dev` - Inicia em modo desenvolvimento
- `npm run build` - Compila o TypeScript
- `npm start` - Inicia a aplicação em produção
- `npm test` - Executa os testes
- `npm run prisma:generate` - Gera o Prisma Client
- `npm run prisma:migrate` - Executa migrações
- `npm run prisma:seed` - Popula o banco com dados de teste
- `npm run prisma:studio` - Abre o Prisma Studio


