import { RegistroSaude } from '../../domain/RegistroSaude';
import { RegistroSaudeRepository } from '../../infrastructure/repositories/RegistroSaudeRepository';

export type ListRegistroSaudeInput = {
  userId: number;
  userType: 'Tutor' | 'Veterinário';
};

export class ListRegistroSaude {
  constructor(private readonly registroRepo: RegistroSaudeRepository) {}

  execute(input: ListRegistroSaudeInput): RegistroSaude[] {
    if (input.userType === 'Veterinário') {
      return this.registroRepo.findAllSharedWithVet(input.userId);
    }
    return this.registroRepo.findAll(input.userId);
  }
}
