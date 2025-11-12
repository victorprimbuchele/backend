FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Stage de produção
FROM node:20-alpine

WORKDIR /app

# Instalar dependências necessárias para Prisma
RUN apk add --no-cache openssl

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar apenas dependências de produção
RUN npm ci --only=production

# Copiar Prisma CLI do builder (necessário para migrate deploy)
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Copiar Prisma Client gerado e código compilado
# O @prisma/client já está instalado via npm ci, mas precisamos copiar o client gerado
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

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

