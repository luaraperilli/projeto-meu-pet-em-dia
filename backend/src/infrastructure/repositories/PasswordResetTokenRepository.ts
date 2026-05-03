import { PasswordResetToken } from '../../domain/PasswordResetToken';

export interface PasswordResetTokenRepository {
  create(userId: number, token: string, expiresAt: string): PasswordResetToken;
  findByToken(token: string): PasswordResetToken | null;
  markUsed(id: number): void;
}
