import { db } from '../db';
import { Financeiro, FinanceiroInputDTO } from '../../domain/Financeiro';
import { FinanceiroRepository } from './FinanceiroRepository';

export class SqliteFinanceiroRepository implements FinanceiroRepository {
  create(data: FinanceiroInputDTO & { userId: number }): Financeiro {
    const info = db
      .prepare(
        `INSERT INTO financeiro (petId, userId, categoria, data, valor, observacoes)
         VALUES (@petId, @userId, @categoria, @data, @valor, @observacoes)`,
      )
      .run({
        petId: data.petId,
        userId: data.userId,
        categoria: data.categoria,
        data: data.data,
        valor: data.valor,
        observacoes: data.observacoes ?? null,
      });
    return db.prepare('SELECT * FROM financeiro WHERE id = ?').get(info.lastInsertRowid as number) as Financeiro;
  }

  update(id: number, data: Partial<FinanceiroInputDTO>): Financeiro {
    const current = this.findById(id);
    if (!current) throw new Error('FinanceiroNotFound');
    const next: Financeiro = { ...current, ...data };
    db.prepare(
      `UPDATE financeiro SET petId = ?, categoria = ?, data = ?, valor = ?, observacoes = ? WHERE id = ?`,
    ).run(next.petId, next.categoria, next.data, next.valor, next.observacoes ?? null, id);
    return this.findById(id)!;
  }

  delete(id: number): void {
    db.prepare('DELETE FROM financeiro WHERE id = ?').run(id);
  }

  findById(id: number): Financeiro | null {
    const row = db.prepare('SELECT * FROM financeiro WHERE id = ?').get(id) as Financeiro | undefined;
    return row ?? null;
  }

  findAllByOwner(
    ownerId: number,
    filter?: { petId?: number; categoria?: string; from?: string; to?: string },
  ): Financeiro[] {
    const clauses: string[] = ['f.userId = ?'];
    const params: unknown[] = [ownerId];
    if (filter?.petId) {
      clauses.push('f.petId = ?');
      params.push(filter.petId);
    }
    if (filter?.categoria) {
      clauses.push('f.categoria = ?');
      params.push(filter.categoria);
    }
    if (filter?.from) {
      clauses.push('f.data >= ?');
      params.push(filter.from);
    }
    if (filter?.to) {
      clauses.push('f.data <= ?');
      params.push(filter.to);
    }
    const sql = `
      SELECT f.*, p.name AS petName, p.species AS petSpecies
      FROM financeiro f
      JOIN pets p ON f.petId = p.id
      WHERE ${clauses.join(' AND ')}
      ORDER BY f.data DESC, f.id DESC
    `;
    return db.prepare(sql).all(...params) as Financeiro[];
  }
}
