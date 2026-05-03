import { RegistroSaudeRepository } from '../../infrastructure/repositories/RegistroSaudeRepository';
import { PetRepository } from '../../infrastructure/repositories/PetRepository';
import { PetAccessRepository } from '../../infrastructure/repositories/PetAccessRepository';

export type DeleteRegistroSaudeInput = {
  registroId: number;
  userId: number;
  userType: 'Tutor' | 'Veterinário';
};

export class DeleteRegistroSaude {
  constructor(
    private readonly registroRepo: RegistroSaudeRepository,
    private readonly petRepo: PetRepository,
    private readonly petAccessRepo: PetAccessRepository,
  ) {}

  execute(input: DeleteRegistroSaudeInput): void {
    const { registroId, userId, userType } = input;

    const registro = this.registroRepo.findById(registroId);
    if (!registro) throw new Error('RegistroNotFound');

    const pet = this.petRepo.findById(registro.petId);
    if (!pet) throw new Error('PetNotFound');

    const isOwner = pet.ownerId === userId;
    const isSharedVet = userType === 'Veterinário' && this.petAccessRepo.hasAccess(registro.petId, userId);
    if (!isOwner && !isSharedVet) throw new Error('RegistroAccessDenied');

    this.registroRepo.delete(registroId);
  }
}
