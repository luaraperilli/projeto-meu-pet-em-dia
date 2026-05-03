import { CATEGORIAS_FINANCEIRO, Financeiro, FinanceiroInputDTO } from '../../domain/Financeiro';
import { FinanceiroRepository } from '../../infrastructure/repositories/FinanceiroRepository';
import { PetRepository } from '../../infrastructure/repositories/PetRepository';

export type UpdateFinanceiroInput = {
  id: number;
  userId: number;
  data: Partial<FinanceiroInputDTO>;
};

export class UpdateFinanceiro {
  constructor(
    private readonly financeiroRepo: FinanceiroRepository,
    private readonly petRepo: PetRepository,
  ) {}

  execute(input: UpdateFinanceiroInput): Financeiro {
    const { id, userId, data } = input;
    const errors: Record<string, string> = {};

    const registro = this.financeiroRepo.findById(id);
    if (!registro) throw new Error('FinanceiroNotFound');
    if (registro.userId !== userId) throw new Error('FinanceiroAccessDenied');

    if (data.petId !== undefined) {
      const pet = this.petRepo.findById(data.petId);
      if (!pet || pet.ownerId !== userId) throw new Error('PetAccessDenied');
    }
    if (data.categoria !== undefined && !CATEGORIAS_FINANCEIRO.includes(data.categoria)) {
      errors.categoria = 'Categoria inválida';
    }
    if (data.valor !== undefined && (isNaN(data.valor) || data.valor < 0)) {
      errors.valor = 'Valor deve ser positivo';
    }
    if (data.observacoes && data.observacoes.length > 200) {
      errors.observacoes = 'Observações deve ter no máximo 200 caracteres';
    }

    if (Object.keys(errors).length) {
      const err = new Error('ValidationError') as Error & { errors?: Record<string, string> };
      err.errors = errors;
      throw err;
    }

    return this.financeiroRepo.update(id, data);
  }
}
