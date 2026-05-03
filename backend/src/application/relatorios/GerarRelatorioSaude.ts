import { RegistroSaude } from '../../domain/RegistroSaude';
import { Agenda } from '../../domain/Agenda';
import { Pet } from '../../domain/Pet';
import { db } from '../../infrastructure/db';
import { PetRepository } from '../../infrastructure/repositories/PetRepository';

export type GerarRelatorioSaudeInput = {
  userId: number;
  petId: number;
  from: string;
  to: string;
};

export type RelatorioSaude = {
  pet: Pet;
  periodo: { from: string; to: string };
  registros: RegistroSaude[];
  agenda: Agenda[];
};

export class GerarRelatorioSaude {
  constructor(private readonly petRepo: PetRepository) {}

  execute(input: GerarRelatorioSaudeInput): RelatorioSaude {
    const pet = this.petRepo.findById(input.petId);
    if (!pet) throw new Error('PetNotFound');
    if (pet.ownerId !== input.userId) throw new Error('PetAccessDenied');

    const registros = db
      .prepare(
        `SELECT * FROM registros_saude
         WHERE petId = ? AND data >= ? AND data <= ?
         ORDER BY data DESC, horario DESC`,
      )
      .all(input.petId, input.from, input.to) as RegistroSaude[];

    const agenda = db
      .prepare(
        `SELECT * FROM agenda
         WHERE petId = ? AND data >= ? AND data <= ?
         ORDER BY data DESC, horario DESC`,
      )
      .all(input.petId, input.from, input.to) as Agenda[];

    return {
      pet,
      periodo: { from: input.from, to: input.to },
      registros,
      agenda,
    };
  }
}
