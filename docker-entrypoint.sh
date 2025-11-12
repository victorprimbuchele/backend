#!/bin/sh
set -e

echo "🔄 Aguardando banco de dados estar disponível..."
node wait-for-db.js

echo "🔄 Executando migrações do banco de dados..."
npx prisma migrate deploy

echo "✅ Migrações concluídas!"

echo "🚀 Iniciando aplicação..."
exec npm start

