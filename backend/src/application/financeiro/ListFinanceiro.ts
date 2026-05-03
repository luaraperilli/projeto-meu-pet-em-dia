import { Financeiro } from '../../domain/Financeiro';
import { FinanceiroRepository } from '../../infrastructure/repositories/FinanceiroRepository';

export type ListFinanceiroInput = {
  userId: number;
  filter?: { petId?: number; categoria?: string; from?: string; to?: string };
};

export class ListFinanceiro {
  constructor(private readonly financeiroRepo: FinanceiroRepository) {}

  execute(input: ListFinanceiroInput): Financeiro[] {
    return this.financeiroRepo.findAllByOwner(input.userId, input.filter);
  }
}
