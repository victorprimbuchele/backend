export interface InviteEntity {
  id: string;
  token: string;
  applicationId: string;
  expiresAt: Date;
  usedAt?: Date | null;
}

export interface InviteRepository {
  createForApplication(applicationId: string, token: string, expiresAt: Date): Promise<InviteEntity>;
  findByToken(token: string): Promise<InviteEntity | null>;
  markUsed(id: string, usedAt: Date): Promise<void>;
}


