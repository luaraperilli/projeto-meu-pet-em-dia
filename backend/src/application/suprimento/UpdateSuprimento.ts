import { CATEGORIAS_SUPRIMENTO, Suprimento, SuprimentoInputDTO } from '../../domain/Suprimento';
import { SuprimentoRepository } from '../../infrastructure/repositories/SuprimentoRepository';
import { PetRepository } from '../../infrastructure/repositories/PetRepository';

export type UpdateSuprimentoInput = {
  id: number;
  userId: number;
  data: Partial<SuprimentoInputDTO>;
};

export class UpdateSuprimento {
  constructor(
    private readonly suprimentoRepo: SuprimentoRepository,
    private readonly petRepo: PetRepository,
  ) {}

  execute(input: UpdateSuprimentoInput): Suprimento {
    const { id, userId, data } = input;
    const errors: Record<string, string> = {};

    const suprimento = this.suprimentoRepo.findById(id);
    if (!suprimento) throw new Error('SuprimentoNotFound');
    if (suprimento.userId !== userId) throw new Error('SuprimentoAccessDenied');

    if (data.nome !== undefined && (data.nome.trim().length < 3 || data.nome.length > 100)) {
      errors.nome = 'Nome deve ter entre 3 e 100 caracteres';
    }
    if (data.categoria !== undefined && !CATEGORIAS_SUPRIMENTO.includes(data.categoria)) {
      errors.categoria = 'Categoria inválida';
    }
    if (data.quantidade !== undefined && (isNaN(data.quantidade) || data.quantidade < 0)) {
      errors.quantidade = 'Quantidade deve ser positiva';
    }
    if (data.consumoDiario != null && (isNaN(data.consumoDiario) || data.consumoDiario < 0)) {
      errors.consumoDiario = 'Consumo diário deve ser positivo';
    }
    if (data.diasAlerta !== undefined && (!Number.isInteger(data.diasAlerta) || data.diasAlerta < 1)) {
      errors.diasAlerta = 'Dias de alerta deve ser inteiro ≥ 1';
    }
    if (data.petId != null) {
      const pet = this.petRepo.findById(data.petId);
      if (!pet || pet.ownerId !== userId) throw new Error('PetAccessDenied');
    }

    if (Object.keys(errors).length) {
      const err = new Error('ValidationError') as Error & { errors?: Record<string, string> };
      err.errors = errors;
      throw err;
    }

    return this.suprimentoRepo.update(id, data);
  }
}
