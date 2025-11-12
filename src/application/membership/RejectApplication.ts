import type { ApplicationRepository } from '../ports/ApplicationRepository';

export class RejectApplication {
  constructor(private readonly applications: ApplicationRepository) {}

  async execute(applicationId: string): Promise<void> {
    const exists = await this.applications.findById(applicationId);
    if (!exists) {
      const err = new Error('Application not found');
      // @ts-expect-error attach status
      err.statusCode = 404;
      throw err;
    }
    await this.applications.setStatus(applicationId, 'REJECTED');
  }
}


