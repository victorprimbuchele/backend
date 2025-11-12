FROM node:20-alpine

WORKDIR /app

# Instalar dependências necessárias para Prisma
RUN apk add --no-cache openssl

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar todas as dependências (incluindo devDependencies para desenvolvimento)
RUN npm ci

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Scripts de inicialização
COPY docker-entrypoint.sh ./
COPY wait-for-db.js ./
RUN chmod +x docker-entrypoint.sh

# Expor porta
EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=10s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["./docker-entrypoint.sh"]

