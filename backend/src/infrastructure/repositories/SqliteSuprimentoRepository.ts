import { db } from '../db';
import { Suprimento, SuprimentoInputDTO } from '../../domain/Suprimento';
import { SuprimentoRepository } from './SuprimentoRepository';

export class SqliteSuprimentoRepository implements SuprimentoRepository {
  create(data: SuprimentoInputDTO & { userId: number }): Suprimento {
    const info = db
      .prepare(
        `INSERT INTO suprimentos (userId, petId, nome, categoria, quantidade, unidade, consumoDiario, diasAlerta)
         VALUES (@userId, @petId, @nome, @categoria, @quantidade, @unidade, @consumoDiario, @diasAlerta)`,
      )
      .run({
        userId: data.userId,
        petId: data.petId ?? null,
        nome: data.nome,
        categoria: data.categoria,
        quantidade: data.quantidade,
        unidade: data.unidade,
        consumoDiario: data.consumoDiario ?? null,
        diasAlerta: data.diasAlerta,
      });
    return db.prepare('SELECT * FROM suprimentos WHERE id = ?').get(info.lastInsertRowid as number) as Suprimento;
  }

  update(id: number, data: Partial<SuprimentoInputDTO>): Suprimento {
    const current = this.findById(id);
    if (!current) throw new Error('SuprimentoNotFound');
    const next: Suprimento = { ...current, ...data, updatedAt: new Date().toISOString() };
    db.prepare(
      `UPDATE suprimentos SET
        petId = ?, nome = ?, categoria = ?, quantidade = ?, unidade = ?,
        consumoDiario = ?, diasAlerta = ?, updatedAt = DATETIME('now')
       WHERE id = ?`,
    ).run(
      next.petId ?? null,
      next.nome,
      next.categoria,
      next.quantidade,
      next.unidade,
      next.consumoDiario ?? null,
      next.diasAlerta,
      id,
    );
    return this.findById(id)!;
  }

  delete(id: number): void {
    db.prepare('DELETE FROM suprimentos WHERE id = ?').run(id);
  }

  findById(id: number): Suprimento | null {
    const row = db.prepare('SELECT * FROM suprimentos WHERE id = ?').get(id) as Suprimento | undefined;
    return row ?? null;
  }

  findAllByOwner(ownerId: number): Suprimento[] {
    const sql = `
      SELECT s.*, p.name AS petName
      FROM suprimentos s
      LEFT JOIN pets p ON s.petId = p.id
      WHERE s.userId = ?
      ORDER BY s.nome ASC
    `;
    return db.prepare(sql).all(ownerId) as Suprimento[];
  }
}
