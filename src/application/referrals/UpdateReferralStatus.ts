import type { ReferralRepository, ReferralStatus } from '../ports/ReferralRepository';

export class UpdateReferralStatus {
  constructor(private readonly referrals: ReferralRepository) {}

  async execute(id: string, status: ReferralStatus): Promise<void> {
    await this.referrals.updateStatus(id, status);
  }
}


