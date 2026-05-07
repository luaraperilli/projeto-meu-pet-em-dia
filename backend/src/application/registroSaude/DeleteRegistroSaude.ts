import { RegistroSaudeRepository } from '../../infrastructure/repositories/RegistroSaudeRepository';
import { PetRepository } from '../../infrastructure/repositories/PetRepository';

export type DeleteRegistroSaudeInput = {
  registroId: number;
  userId: number;
};

export class DeleteRegistroSaude {
  constructor(
    private readonly registroRepo: RegistroSaudeRepository,
    private readonly petRepo: PetRepository,
  ) {}

  execute(input: DeleteRegistroSaudeInput): void {
    const { registroId, userId } = input;

    const registro = this.registroRepo.findById(registroId);
    if (!registro) throw new Error('RegistroNotFound');

    const pet = this.petRepo.findById(registro.petId);
    if (!pet) throw new Error('PetNotFound');
    if (pet.ownerId !== userId) {
      throw new Error('RegistroAccessDenied: apenas o tutor do pet pode remover registros.');
    }

    this.registroRepo.delete(registroId);
  }
}
