export type ReferralStatus = 'NEW' | 'IN_CONTACT' | 'CLOSED' | 'DECLINED';

export interface CreateReferralInput {
  fromMemberId: string;
  toMemberId: string;
  companyOrContact: string;
  description: string;
}

export interface ReferralEntity {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  companyOrContact: string;
  description: string;
  status: ReferralStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface ReferralRepository {
  create(input: CreateReferralInput): Promise<ReferralEntity>;
  listForMember(
    memberId: string,
    params?: PaginationParams
  ): Promise<{
    mine: PaginatedResult<ReferralEntity>;
    toMe: PaginatedResult<ReferralEntity>;
  }>;
  updateStatus(id: string, status: ReferralStatus): Promise<void>;
}


