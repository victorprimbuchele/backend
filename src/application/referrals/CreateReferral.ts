import type { CreateReferralInput, ReferralEntity, ReferralRepository } from '../ports/ReferralRepository';

export class CreateReferral {
  constructor(private readonly referrals: ReferralRepository) {}

  async execute(input: CreateReferralInput): Promise<ReferralEntity> {
    return this.referrals.create(input);
  }
}


