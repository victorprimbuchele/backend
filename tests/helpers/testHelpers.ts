import { PrismaClient } from '@prisma/client';
import type { ApplicationStatus, ReferralStatus } from '@prisma/client';
import { execSync } from 'child_process';

export const prisma = new PrismaClient();

/**
 * Limpeza rápida do banco (deleteMany)
 * Use esta função no beforeEach para limpeza rápida entre testes
 * Use cleanupDatabase() no beforeAll se precisar de um reset completo
 */
export async function cleanupDatabase() {
  // Ordem CRÍTICA: deletar dependências primeiro para evitar foreign key constraints
  // A ordem deve ser: referrals -> invites -> applications -> members
  // Isso garante que não há referências quando deletamos os registros principais
  
  // Deletar referrals primeiro (não tem dependências)
  await prisma.referral.deleteMany({});
  
  // Deletar invites (depende de applications, mas não impede deleção de applications)
  await prisma.invite.deleteMany({});
  
  // Deletar applications (não tem mais invites referenciando)
  await prisma.application.deleteMany({});
  
  // Deletar members por último (não tem mais referrals referenciando)
  await prisma.member.deleteMany({});
}

export async function createTestMember(data?: { name?: string; email?: string; company?: string }) {
  return prisma.member.create({
    data: {
      name: data?.name ?? 'Test Member',
      email: data?.email ?? `test-${Date.now()}@example.com`,
      company: data?.company ?? 'Test Company',
    },
  });
}

export async function createTestApplication(data?: {
  name?: string;
  email?: string;
  company?: string;
  motivation?: string;
  status?: ApplicationStatus;
}) {
  return prisma.application.create({
    data: {
      name: data?.name ?? 'Test Applicant',
      email: data?.email ?? `applicant-${Date.now()}@example.com`,
      company: data?.company ?? 'Test Company',
      motivation: data?.motivation ?? 'Test motivation',
      status: data?.status ?? 'PENDING',
    },
  });
}

export async function createTestInvite(applicationId: string, token?: string) {
  return prisma.invite.create({
    data: {
      applicationId,
      token: token ?? `token-${Date.now()}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    },
  });
}

export async function createTestReferral(data: {
  fromMemberId: string;
  toMemberId: string;
  companyOrContact?: string;
  description?: string;
  status?: ReferralStatus;
}) {
  return prisma.referral.create({
    data: {
      fromMemberId: data.fromMemberId,
      toMemberId: data.toMemberId,
      companyOrContact: data.companyOrContact ?? 'Test Company',
      description: data.description ?? 'Test description',
      status: data.status ?? 'NEW',
    },
  });
}

export const ADMIN_KEY = 'test-admin-key-123';
export const TEST_MEMBER_ID = 'test-member-id-123';

export function getAdminHeaders() {
  return { 'X-ADMIN-KEY': ADMIN_KEY };
}

export function getMemberHeaders(memberId?: string) {
  return { 'X-MEMBER-ID': memberId ?? TEST_MEMBER_ID };
}

