import { RegistroSaude, RegistroSaudeInputDTO } from '../../domain/RegistroSaude';
import { RegistroSaudeRepository } from '../../infrastructure/repositories/RegistroSaudeRepository';
import { PetRepository } from '../../infrastructure/repositories/PetRepository';
import { PetAccessRepository } from '../../infrastructure/repositories/PetAccessRepository';

export type UpdateRegistroSaudeInput = {
  registroId: number;
  userId: number;
  userType: 'Tutor' | 'Veterinário';
  data: Partial<Omit<RegistroSaudeInputDTO, 'petId' | 'tipoRegistro' | 'data' | 'horario'>>;
};

export class UpdateRegistroSaude {
  constructor(
    private readonly registroRepo: RegistroSaudeRepository,
    private readonly petRepo: PetRepository,
    private readonly petAccessRepo: PetAccessRepository,
  ) {}

  execute(input: UpdateRegistroSaudeInput): RegistroSaude {
    const { registroId, userId, userType, data } = input;
    const errors: Record<string, string> = {};

    const registro = this.registroRepo.findById(registroId);
    if (!registro) throw new Error('RegistroNotFound');

    const pet = this.petRepo.findById(registro.petId);
    if (!pet) throw new Error('PetNotFound');

    const isOwner = pet.ownerId === userId;
    const isSharedVet = userType === 'Veterinário' && this.petAccessRepo.hasAccess(registro.petId, userId);
    if (!isOwner && !isSharedVet) throw new Error('RegistroAccessDenied');

    if (data.profissional && (data.profissional.trim().length < 3 || data.profissional.length > 100)) {
      errors.profissional = 'Profissional deve ter entre 3 e 100 caracteres';
    }
    if (Object.keys(errors).length) {
      const err = new Error('ValidationError') as Error & { errors?: Record<string, string> };
      err.errors = errors;
      throw err;
    }

    return this.registroRepo.update(registroId, data);
  }
}
