import { prisma } from '../prisma/client';
import type {
  ApplicationEntity,
  ApplicationRepository,
  ApplicationStatus,
  CreateApplicationInput,
  PaginationParams,
  PaginatedResult,
} from '../../application/ports/ApplicationRepository';

export class ApplicationPrismaRepository implements ApplicationRepository {
  async create(input: CreateApplicationInput): Promise<ApplicationEntity> {
    const created = await prisma.application.create({
      data: {
        name: input.name,
        email: input.email,
        company: input.company ?? null,
        motivation: input.motivation,
        status: 'PENDING',
      },
    });
    return created;
  }

  async listAll(params?: PaginationParams): Promise<PaginatedResult<ApplicationEntity>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.application.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.application.count(),
    ]);

    return { data, total };
  }

  async setStatus(id: string, status: ApplicationStatus): Promise<void> {
    await prisma.application.update({
      where: { id },
      data: { status },
    });
  }

  async findById(id: string): Promise<ApplicationEntity | null> {
    return prisma.application.findUnique({ where: { id } });
  }
}


