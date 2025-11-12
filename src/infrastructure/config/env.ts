export function getInviteExpirationDays(): number {
  const raw = process.env.INVITE_EXPIRATION_DAYS;
  const n = raw ? Number(raw) : 7;
  return Number.isFinite(n) && n > 0 ? n : 7;
}

export function getAdminKey(): string | null {
  return process.env.ADMIN_KEY ?? null;
}


