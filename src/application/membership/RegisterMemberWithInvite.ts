import type { InviteRepository } from '../ports/InviteRepository';
import type { CreateMemberInput, MemberEntity, MemberRepository } from '../ports/MemberRepository';

export class RegisterMemberWithInvite {
  constructor(
    private readonly invites: InviteRepository,
    private readonly members: MemberRepository
  ) {}

  async execute(token: string, input: CreateMemberInput): Promise<MemberEntity> {
    const invite = await this.invites.findByToken(token);
    if (!invite) {
      const err = new Error('Invalid invite token');
      // @ts-expect-error
      err.statusCode = 400;
      throw err;
    }
    if (invite.usedAt) {
      const err = new Error('Invite already used');
      // @ts-expect-error
      err.statusCode = 400;
      throw err;
    }
    if (invite.expiresAt.getTime() < Date.now()) {
      const err = new Error('Invite expired');
      // @ts-expect-error
      err.statusCode = 400;
      throw err;
    }

    const created = await this.members.create(input);
    await this.invites.markUsed(invite.id, new Date());
    return created;
  }
}


