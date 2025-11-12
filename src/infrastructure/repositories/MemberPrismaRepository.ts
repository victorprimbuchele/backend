import { prisma } from '../prisma/client';
import type { CreateMemberInput, MemberEntity, MemberRepository } from '../../application/ports/MemberRepository';

export class MemberPrismaRepository implements MemberRepository {
  async create(input: CreateMemberInput): Promise<MemberEntity> {
    const created = await prisma.member.create({
      data: {
        name: input.name,
        email: input.email,
        company: input.company ?? null,
      },
    });
    return created;
  }

  async findById(id: string): Promise<MemberEntity | null> {
    return prisma.member.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<MemberEntity | null> {
    return prisma.member.findUnique({ where: { email } });
  }
}


