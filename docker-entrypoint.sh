#!/bin/sh
set -e

echo "🔄 Aguardando banco de dados estar disponível..."
node wait-for-db.js

echo "🔄 Executando migrações do banco de dados..."
npx prisma migrate deploy

echo "✅ Migrações concluídas!"

echo "🌱 Executando seed para popular dados de teste..."
npx prisma db seed || echo "⚠️  Seed não executado (pode ser normal se já houver dados)"

echo "✅ Seed concluído!"

echo "🚀 Iniciando aplicação em modo desenvolvimento..."
exec npm run dev

