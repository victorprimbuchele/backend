export interface CreateMemberInput {
  name: string;
  email: string;
  company?: string | null;
}

export interface MemberEntity {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  joinedAt: Date;
  isActive: boolean;
}

export interface MemberRepository {
  create(input: CreateMemberInput): Promise<MemberEntity>;
  findById(id: string): Promise<MemberEntity | null>;
  findByEmail(email: string): Promise<MemberEntity | null>;
}


