import { PasswordResetTokenRepository } from '../../infrastructure/repositories/PasswordResetTokenRepository';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { hashPassword } from '../password';
import { isValidPassword } from '../validators';

export type ConfirmPasswordResetInput = {
  token: string;
  newPassword: string;
};

export class ConfirmPasswordReset {
  constructor(
    private readonly tokenRepo: PasswordResetTokenRepository,
    private readonly userRepo: UserRepository,
  ) {}

  execute(input: ConfirmPasswordResetInput): void {
    const reset = this.tokenRepo.findByToken(input.token);
    if (!reset) throw new Error('TokenInvalid');
    if (reset.usedAt) throw new Error('TokenAlreadyUsed');
    if (new Date(reset.expiresAt).getTime() < Date.now()) throw new Error('TokenExpired');

    if (!isValidPassword(input.newPassword)) {
      const err = new Error('ValidationError') as Error & { errors?: Record<string, string> };
      err.errors = { password: 'Senha inválida (8-12, com número, especial e maiúscula)' };
      throw err;
    }

    this.userRepo.update(reset.userId, { passwordHash: hashPassword(input.newPassword) });
    this.tokenRepo.markUsed(reset.id);
  }
}
