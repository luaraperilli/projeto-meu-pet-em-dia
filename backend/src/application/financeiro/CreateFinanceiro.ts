import { CATEGORIAS_FINANCEIRO, Financeiro, FinanceiroInputDTO } from '../../domain/Financeiro';
import { FinanceiroRepository } from '../../infrastructure/repositories/FinanceiroRepository';
import { PetRepository } from '../../infrastructure/repositories/PetRepository';

export type CreateFinanceiroInput = {
  userId: number;
  data: FinanceiroInputDTO;
};

export class CreateFinanceiro {
  constructor(
    private readonly financeiroRepo: FinanceiroRepository,
    private readonly petRepo: PetRepository,
  ) {}

  execute(input: CreateFinanceiroInput): Financeiro {
    const { data, userId } = input;
    const errors: Record<string, string> = {};

    const pet = this.petRepo.findById(data.petId);
    if (!pet) throw new Error('PetNotFound');
    if (pet.ownerId !== userId) throw new Error('PetAccessDenied');

    if (!data.categoria || !CATEGORIAS_FINANCEIRO.includes(data.categoria)) {
      errors.categoria = 'Categoria inválida';
    }
    if (!data.data) errors.data = 'Data é obrigatória';
    if (data.valor == null || isNaN(data.valor) || data.valor < 0) {
      errors.valor = 'Valor é obrigatório e deve ser positivo';
    }
    if (data.observacoes && data.observacoes.length > 200) {
      errors.observacoes = 'Observações deve ter no máximo 200 caracteres';
    }

    if (Object.keys(errors).length) {
      const err = new Error('ValidationError') as Error & { errors?: Record<string, string> };
      err.errors = errors;
      throw err;
    }

    return this.financeiroRepo.create({ ...data, userId });
  }
}
