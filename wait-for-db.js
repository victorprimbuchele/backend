// Script para aguardar o banco de dados estar disponível
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const MAX_ATTEMPTS = 30;
const DELAY = 2000; // 2 segundos

async function waitForDatabase() {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await prisma.$connect();
      console.log('✅ Banco de dados está disponível!');
      await prisma.$disconnect();
      process.exit(0);
    } catch (error) {
      if (attempt >= MAX_ATTEMPTS) {
        console.error(`❌ Timeout: Banco de dados não ficou disponível após ${MAX_ATTEMPTS} tentativas`);
        process.exit(1);
      }
      console.log(`⏳ Tentativa ${attempt}/${MAX_ATTEMPTS}: Banco ainda não está pronto, aguardando...`);
      await new Promise((resolve) => setTimeout(resolve, DELAY));
    }
  }
}

waitForDatabase();

