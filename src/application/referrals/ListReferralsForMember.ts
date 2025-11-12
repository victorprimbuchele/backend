import type { ReferralRepository, PaginationParams } from '../ports/ReferralRepository';

export class ListReferralsForMember {
  constructor(private readonly referrals: ReferralRepository) {}

  async execute(memberId: string, params?: PaginationParams) {
    return this.referrals.listForMember(memberId, params);
  }
}


