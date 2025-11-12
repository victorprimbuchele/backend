import { PrismaClient, ApplicationStatus, ReferralStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpar dados existentes (opcional - comentar se quiser manter dados existentes)
  console.log('🧹 Limpando dados existentes...');
  await prisma.referral.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.application.deleteMany();
  await prisma.member.deleteMany();

  // Criar Membros
  console.log('👥 Criando membros...');
  const members = await Promise.all([
    prisma.member.create({
      data: {
        name: 'João Silva',
        email: 'joao.silva@example.com',
        company: 'Tech Corp',
      },
    }),
    prisma.member.create({
      data: {
        name: 'Maria Santos',
        email: 'maria.santos@example.com',
        company: 'Innovation Labs',
      },
    }),
    prisma.member.create({
      data: {
        name: 'Pedro Oliveira',
        email: 'pedro.oliveira@example.com',
        company: 'Digital Solutions',
      },
    }),
    prisma.member.create({
      data: {
        name: 'Ana Costa',
        email: 'ana.costa@example.com',
        company: 'StartupHub',
      },
    }),
    prisma.member.create({
      data: {
        name: 'Carlos Ferreira',
        email: 'carlos.ferreira@example.com',
        company: 'CloudTech',
      },
    }),
    prisma.member.create({
      data: {
        name: 'Julia Almeida',
        email: 'julia.almeida@example.com',
        company: 'DataViz',
      },
    }),
    prisma.member.create({
      data: {
        name: 'Roberto Lima',
        email: 'roberto.lima@example.com',
        company: 'AI Solutions',
      },
    }),
    prisma.member.create({
      data: {
        name: 'Fernanda Rocha',
        email: 'fernanda.rocha@example.com',
        company: 'MobileFirst',
      },
    }),
  ]);

  console.log(`✅ ${members.length} membros criados`);

  // Criar Applications (30 aplicações para testar paginação)
  console.log('📝 Criando aplicações...');
  const applications = [];
  const statuses: ApplicationStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];
  const companies = [
    'TechStart',
    'InnovateNow',
    'FutureTech',
    'CloudNine',
    'DataDriven',
    'SmartSolutions',
    'NextGen',
    'DigitalFirst',
    'AgileCorp',
    'ScaleUp',
  ];

  for (let i = 1; i <= 30; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    
    const app = await prisma.application.create({
      data: {
        name: `Candidato ${i}`,
        email: `candidato${i}@example.com`,
        company: `${company} ${i}`,
        motivation: `Motivação do candidato ${i}: Estou interessado em fazer parte da comunidade e contribuir com minha experiência em tecnologia.`,
        status,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Diferentes datas
      },
    });
    applications.push(app);
  }

  console.log(`✅ ${applications.length} aplicações criadas`);

  // Criar alguns invites para aplicações aprovadas
  console.log('🎫 Criando convites...');
  const approvedApps = applications.filter((app) => app.status === 'APPROVED');
  for (const app of approvedApps.slice(0, 5)) {
    await prisma.invite.create({
      data: {
        applicationId: app.id,
        token: `token-${app.id}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      },
    });
  }
  console.log(`✅ ${approvedApps.slice(0, 5).length} convites criados`);

  // Criar Referrals (50 referrals para testar paginação)
  console.log('🔗 Criando referrals...');
  const referralStatuses: ReferralStatus[] = ['NEW', 'IN_CONTACT', 'CLOSED', 'DECLINED'];
  const companiesOrContacts = [
    'Google',
    'Microsoft',
    'Amazon',
    'Apple',
    'Meta',
    'Netflix',
    'Tesla',
    'Oracle',
    'IBM',
    'Salesforce',
    'Adobe',
    'Intel',
    'NVIDIA',
    'Cisco',
    'VMware',
  ];

  const referrals = [];
  for (let i = 1; i <= 50; i++) {
    const fromMember = members[Math.floor(Math.random() * members.length)];
    let toMember = members[Math.floor(Math.random() * members.length)];
    // Garantir que fromMember e toMember sejam diferentes
    while (toMember.id === fromMember.id) {
      toMember = members[Math.floor(Math.random() * members.length)];
    }

    const status = referralStatuses[Math.floor(Math.random() * referralStatuses.length)];
    const companyOrContact = companiesOrContacts[Math.floor(Math.random() * companiesOrContacts.length)];

    const referral = await prisma.referral.create({
      data: {
        fromMemberId: fromMember.id,
        toMemberId: toMember.id,
        companyOrContact,
        description: `Referral ${i}: Oportunidade interessante na ${companyOrContact} relacionada a desenvolvimento de software e inovação tecnológica.`,
        status,
        createdAt: new Date(Date.now() - i * 12 * 60 * 60 * 1000), // Diferentes datas
      },
    });
    referrals.push(referral);
  }

  console.log(`✅ ${referrals.length} referrals criados`);

  // Criar alguns referrals específicos para um membro (para testar paginação de "mine" e "toMe")
  console.log('🔗 Criando referrals adicionais para teste de paginação...');
  const testMember = members[0]; // João Silva
  const otherMembers = members.slice(1);

  // Criar 15 referrals onde João é o fromMember
  for (let i = 1; i <= 15; i++) {
    const toMember = otherMembers[Math.floor(Math.random() * otherMembers.length)];
    await prisma.referral.create({
      data: {
        fromMemberId: testMember.id,
        toMemberId: toMember.id,
        companyOrContact: `Empresa Teste ${i}`,
        description: `Referral de teste ${i} criado por João Silva para ${toMember.name}`,
        status: referralStatuses[Math.floor(Math.random() * referralStatuses.length)],
        createdAt: new Date(Date.now() - i * 6 * 60 * 60 * 1000),
      },
    });
  }

  // Criar 12 referrals onde João é o toMember
  for (let i = 1; i <= 12; i++) {
    const fromMember = otherMembers[Math.floor(Math.random() * otherMembers.length)];
    await prisma.referral.create({
      data: {
        fromMemberId: fromMember.id,
        toMemberId: testMember.id,
        companyOrContact: `Contato Teste ${i}`,
        description: `Referral de teste ${i} criado por ${fromMember.name} para João Silva`,
        status: referralStatuses[Math.floor(Math.random() * referralStatuses.length)],
        createdAt: new Date(Date.now() - i * 8 * 60 * 60 * 1000),
      },
    });
  }

  console.log('✅ Referrals adicionais criados');

  console.log('\n📊 Resumo do seed:');
  console.log(`   - ${members.length} membros`);
  console.log(`   - ${applications.length} aplicações`);
  console.log(`   - ${approvedApps.slice(0, 5).length} convites`);
  console.log(`   - ${referrals.length + 15 + 12} referrals total`);
  console.log('\n✨ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

