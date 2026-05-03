import crypto from 'node:crypto';
import { PasswordResetTokenRepository } from '../../infrastructure/repositories/PasswordResetTokenRepository';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';

const TOKEN_TTL_HOURS = 1;

export type RequestPasswordResetInput = {
  email: string;
};

export type RequestPasswordResetResult = {
  token: string | null;
  expiresAt: string | null;
};

export class RequestPasswordReset {
  constructor(
    private readonly tokenRepo: PasswordResetTokenRepository,
    private readonly userRepo: UserRepository,
  ) {}

  execute(input: RequestPasswordResetInput): RequestPasswordResetResult {
    const user = this.userRepo.findByEmail(input.email.trim());
    if (!user) return { token: null, expiresAt: null };

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000).toISOString();
    this.tokenRepo.create(user.id!, token, expiresAt);
    return { token, expiresAt };
  }
}
