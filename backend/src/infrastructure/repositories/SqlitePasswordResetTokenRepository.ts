import { db } from '../db';
import { PasswordResetToken } from '../../domain/PasswordResetToken';
import { PasswordResetTokenRepository } from './PasswordResetTokenRepository';

export class SqlitePasswordResetTokenRepository implements PasswordResetTokenRepository {
  create(userId: number, token: string, expiresAt: string): PasswordResetToken {
    const info = db
      .prepare('INSERT INTO password_reset_tokens (userId, token, expiresAt) VALUES (?, ?, ?)')
      .run(userId, token, expiresAt);
    return db
      .prepare('SELECT * FROM password_reset_tokens WHERE id = ?')
      .get(info.lastInsertRowid as number) as PasswordResetToken;
  }

  findByToken(token: string): PasswordResetToken | null {
    const row = db.prepare('SELECT * FROM password_reset_tokens WHERE token = ?').get(token) as
      | PasswordResetToken
      | undefined;
    return row ?? null;
  }

  markUsed(id: number): void {
    db.prepare("UPDATE password_reset_tokens SET usedAt = DATETIME('now') WHERE id = ?").run(id);
  }
}
