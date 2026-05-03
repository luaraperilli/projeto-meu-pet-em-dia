import { CATEGORIAS_SUPRIMENTO, Suprimento, SuprimentoInputDTO } from '../../domain/Suprimento';
import { SuprimentoRepository } from '../../infrastructure/repositories/SuprimentoRepository';
import { PetRepository } from '../../infrastructure/repositories/PetRepository';

export type CreateSuprimentoInput = {
  userId: number;
  data: SuprimentoInputDTO;
};

export class CreateSuprimento {
  constructor(
    private readonly suprimentoRepo: SuprimentoRepository,
    private readonly petRepo: PetRepository,
  ) {}

  execute(input: CreateSuprimentoInput): Suprimento {
    const { data, userId } = input;
    const errors: Record<string, string> = {};

    if (!data.nome || data.nome.trim().length < 3 || data.nome.length > 100) {
      errors.nome = 'Nome deve ter entre 3 e 100 caracteres';
    }
    if (!data.categoria || !CATEGORIAS_SUPRIMENTO.includes(data.categoria)) {
      errors.categoria = 'Categoria inválida';
    }
    if (data.quantidade == null || isNaN(data.quantidade) || data.quantidade < 0) {
      errors.quantidade = 'Quantidade deve ser positiva';
    }
    if (!data.unidade || data.unidade.trim().length === 0) {
      errors.unidade = 'Unidade é obrigatória (ex: kg, ml, unidades)';
    }
    if (data.consumoDiario != null && (isNaN(data.consumoDiario) || data.consumoDiario < 0)) {
      errors.consumoDiario = 'Consumo diário deve ser positivo';
    }
    if (!Number.isInteger(data.diasAlerta) || data.diasAlerta < 1) {
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

    return this.suprimentoRepo.create({
      userId,
      petId: data.petId ?? null,
      nome: data.nome.trim(),
      categoria: data.categoria,
      quantidade: data.quantidade,
      unidade: data.unidade.trim(),
      consumoDiario: data.consumoDiario ?? null,
      diasAlerta: data.diasAlerta,
    });
  }
}
