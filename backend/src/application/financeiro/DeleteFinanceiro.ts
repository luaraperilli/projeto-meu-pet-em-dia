import { FinanceiroRepository } from '../../infrastructure/repositories/FinanceiroRepository';

export type DeleteFinanceiroInput = {
  id: number;
  userId: number;
};

export class DeleteFinanceiro {
  constructor(private readonly financeiroRepo: FinanceiroRepository) {}

  execute(input: DeleteFinanceiroInput): void {
    const registro = this.financeiroRepo.findById(input.id);
    if (!registro) throw new Error('FinanceiroNotFound');
    if (registro.userId !== input.userId) throw new Error('FinanceiroAccessDenied');
    this.financeiroRepo.delete(input.id);
  }
}
