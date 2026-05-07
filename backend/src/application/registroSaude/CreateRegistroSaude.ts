import { RegistroSaude, RegistroSaudeInputDTO, TipoRegistro } from '../../domain/RegistroSaude';
import { RegistroSaudeRepository } from '../../infrastructure/repositories/RegistroSaudeRepository';
import { PetRepository } from '../../infrastructure/repositories/PetRepository';

const TIPOS_VALIDOS: readonly string[] = ['Vacina', 'Cirurgia', 'Exame', 'Observação'];

export type CreateRegistroSaudeInput = {
  userId: number;
  data: Omit<RegistroSaudeInputDTO, 'userId'> & {
    petId: number;
  };
};

export class CreateRegistroSaude {
  constructor(
    private readonly registroRepo: RegistroSaudeRepository,
    private readonly petRepo: PetRepository,
  ) {}

  execute(input: CreateRegistroSaudeInput): RegistroSaude {
    const { data, userId } = input;
    const errors: Record<string, string> = {};

    const pet = this.petRepo.findById(data.petId);
    if (!pet) throw new Error('PetNotFound');
    if (pet.ownerId !== userId) throw new Error('PetAccessDenied');

    const profissionalLimpo = data.profissional?.trim() || '';

    if (!data.data) errors.data = 'Data é obrigatória';
    if (!data.horario) errors.horario = 'Horário é obrigatório';

    if (!profissionalLimpo) errors.profissional = 'Profissional é obrigatório';
    if (profissionalLimpo.length < 3 || profissionalLimpo.length > 100)
      errors.profissional = 'Profissional deve ter entre 3 e 100 caracteres';

    if (!data.tipoRegistro || !TIPOS_VALIDOS.includes(data.tipoRegistro))
      errors.tipoRegistro = 'Tipo de registro inválido';

    if (Object.keys(errors).length) {
      const err = new Error('ValidationError') as Error & { errors?: Record<string, string> };
      err.errors = errors;
      throw err;
    }

    const cleanedData: RegistroSaudeInputDTO & { userId: number } = {
      userId,
      petId: data.petId,
      tipoRegistro: data.tipoRegistro as TipoRegistro,
      data: data.data.trim(),
      horario: data.horario.trim(),
      profissional: profissionalLimpo,
    };

    return this.registroRepo.create(cleanedData);
  }
}
