import { db } from '../db';
import { Avaliacao, AvaliacaoInputDTO } from '../../domain/Avaliacao';
import { AvaliacaoRepository } from './AvaliacaoRepository';

export class SqliteAvaliacaoRepository implements AvaliacaoRepository {
  create(data: AvaliacaoInputDTO & { userId: number }): Avaliacao {
    const info = db
      .prepare(
        `INSERT INTO avaliacoes (userId, profissional, servico, nota, comentario)
         VALUES (@userId, @profissional, @servico, @nota, @comentario)`,
      )
      .run({
        userId: data.userId,
        profissional: data.profissional,
        servico: data.servico,
        nota: data.nota,
        comentario: data.comentario ?? null,
      });
    return db.prepare('SELECT * FROM avaliacoes WHERE id = ?').get(info.lastInsertRowid as number) as Avaliacao;
  }

  update(id: number, data: Partial<AvaliacaoInputDTO>): Avaliacao {
    const current = this.findById(id);
    if (!current) throw new Error('AvaliacaoNotFound');
    const next: Avaliacao = { ...current, ...data };
    db.prepare(
      `UPDATE avaliacoes SET profissional = ?, servico = ?, nota = ?, comentario = ? WHERE id = ?`,
    ).run(next.profissional, next.servico, next.nota, next.comentario ?? null, id);
    return this.findById(id)!;
  }

  delete(id: number): void {
    db.prepare('DELETE FROM avaliacoes WHERE id = ?').run(id);
  }

  findById(id: number): Avaliacao | null {
    const row = db.prepare('SELECT * FROM avaliacoes WHERE id = ?').get(id) as Avaliacao | undefined;
    return row ?? null;
  }

  findAll(filter?: { profissional?: string; servico?: string; nota?: number }): Avaliacao[] {
    const clauses: string[] = [];
    const params: unknown[] = [];
    if (filter?.profissional) {
      clauses.push('profissional LIKE ?');
      params.push(`%${filter.profissional}%`);
    }
    if (filter?.servico) {
      clauses.push('servico LIKE ?');
      params.push(`%${filter.servico}%`);
    }
    if (filter?.nota) {
      clauses.push('nota = ?');
      params.push(filter.nota);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const sql = `
      SELECT a.*, u.name AS autorNome
      FROM avaliacoes a
      JOIN users u ON a.userId = u.id
      ${where}
      ORDER BY a.data DESC, a.id DESC
    `;
    return db.prepare(sql).all(...params) as Avaliacao[];
  }

  findAllByUser(userId: number): Avaliacao[] {
    return db
      .prepare('SELECT * FROM avaliacoes WHERE userId = ? ORDER BY data DESC, id DESC')
      .all(userId) as Avaliacao[];
  }
}
