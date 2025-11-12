import { prisma } from '../prisma/client';
import type { InviteEntity, InviteRepository } from '../../application/ports/InviteRepository';

export class InvitePrismaRepository implements InviteRepository {
  async createForApplication(applicationId: string, token: string, expiresAt: Date): Promise<InviteEntity> {
    const created = await prisma.invite.create({
      data: {
        applicationId,
        token,
        expiresAt,
      },
    });
    return created;
  }

  async findByToken(token: string): Promise<InviteEntity | null> {
    return prisma.invite.findUnique({ where: { token } });
  }

  async markUsed(id: string, usedAt: Date): Promise<void> {
    await prisma.invite.update({
      where: { id },
      data: { usedAt },
    });
  }
}


