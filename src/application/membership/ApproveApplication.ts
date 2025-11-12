import type { ApplicationRepository } from '../ports/ApplicationRepository';
import type { InviteRepository } from '../ports/InviteRepository';
import { getInviteExpirationDays } from '../../infrastructure/config/env';
import crypto from 'crypto';

export class ApproveApplication {
  constructor(
    private readonly applications: ApplicationRepository,
    private readonly invites: InviteRepository
  ) {}

  async execute(applicationId: string): Promise<{ token: string; inviteUrl: string }> {
    const app = await this.applications.findById(applicationId);
    if (!app) {
      const err = new Error('Application not found');
      // @ts-expect-error attach status
      err.statusCode = 404;
      throw err;
    }

    await this.applications.setStatus(applicationId, 'APPROVED');

    const token = crypto.randomUUID();
    const days = getInviteExpirationDays();
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    await this.invites.createForApplication(applicationId, token, expiresAt);

    // In real world, send email. Here we return the URL to be logged by controller.
    const inviteUrl = `/register?token=${token}`;
    return { token, inviteUrl };
  }
}


