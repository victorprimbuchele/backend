import { prisma } from '../prisma/client';
import type {
  CreateReferralInput,
  ReferralEntity,
  ReferralRepository,
  ReferralStatus,
  PaginationParams,
  PaginatedResult,
} from '../../application/ports/ReferralRepository';

export class ReferralPrismaRepository implements ReferralRepository {
  async create(input: CreateReferralInput): Promise<ReferralEntity> {
    const created = await prisma.referral.create({
      data: {
        fromMemberId: input.fromMemberId,
        toMemberId: input.toMemberId,
        companyOrContact: input.companyOrContact,
        description: input.description,
      },
    });
    return created;
  }

  async listForMember(
    memberId: string,
    params?: PaginationParams
  ): Promise<{
    mine: PaginatedResult<ReferralEntity>;
    toMe: PaginatedResult<ReferralEntity>;
  }> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [mineData, mineTotal, toMeData, toMeTotal] = await Promise.all([
      prisma.referral.findMany({
        where: { fromMemberId: memberId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.referral.count({ where: { fromMemberId: memberId } }),
      prisma.referral.findMany({
        where: { toMemberId: memberId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.referral.count({ where: { toMemberId: memberId } }),
    ]);

    return {
      mine: { data: mineData, total: mineTotal },
      toMe: { data: toMeData, total: toMeTotal },
    };
  }

  async updateStatus(id: string, status: ReferralStatus): Promise<void> {
    await prisma.referral.update({
      where: { id },
      data: { status },
    });
  }
}


