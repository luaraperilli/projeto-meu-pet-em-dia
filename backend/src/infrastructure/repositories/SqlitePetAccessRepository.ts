import { db } from '../db';
import { Pet } from '../../domain/Pet';
import { PetAccess } from '../../domain/PetAccess';
import { PetAccessRepository } from './PetAccessRepository';

export class SqlitePetAccessRepository implements PetAccessRepository {
  grant(petId: number, vetUserId: number): PetAccess {
    const info = db
      .prepare(`INSERT OR IGNORE INTO pet_access (petId, vetUserId) VALUES (?, ?)`)
      .run(petId, vetUserId);
    const id = info.lastInsertRowid as number;
    if (id) return db.prepare('SELECT * FROM pet_access WHERE id = ?').get(id) as PetAccess;
    return db
      .prepare('SELECT * FROM pet_access WHERE petId = ? AND vetUserId = ?')
      .get(petId, vetUserId) as PetAccess;
  }

  revoke(petId: number, vetUserId: number): void {
    db.prepare('DELETE FROM pet_access WHERE petId = ? AND vetUserId = ?').run(petId, vetUserId);
  }

  hasAccess(petId: number, vetUserId: number): boolean {
    const row = db
      .prepare('SELECT 1 FROM pet_access WHERE petId = ? AND vetUserId = ?')
      .get(petId, vetUserId);
    return !!row;
  }

  listAccessByPet(petId: number): Array<PetAccess & { vetName: string; vetEmail: string }> {
    const sql = `
      SELECT pa.*, u.name AS vetName, u.email AS vetEmail
      FROM pet_access pa
      JOIN users u ON pa.vetUserId = u.id
      WHERE pa.petId = ?
      ORDER BY pa.grantedAt DESC
    `;
    return db.prepare(sql).all(petId) as Array<PetAccess & { vetName: string; vetEmail: string }>;
  }

  listPetsSharedWithVet(vetUserId: number): Array<Pet & { ownerName: string }> {
    const sql = `
      SELECT p.*, u.name AS ownerName
      FROM pet_access pa
      JOIN pets p ON pa.petId = p.id
      JOIN users u ON p.ownerId = u.id
      WHERE pa.vetUserId = ?
      ORDER BY p.name ASC
    `;
    return db.prepare(sql).all(vetUserId) as Array<Pet & { ownerName: string }>;
  }
}
