import { SuprimentoRepository } from '../../infrastructure/repositories/SuprimentoRepository';

export type DeleteSuprimentoInput = {
  id: number;
  userId: number;
};

export class DeleteSuprimento {
  constructor(private readonly repo: SuprimentoRepository) {}

  execute(input: DeleteSuprimentoInput): void {
    const suprimento = this.repo.findById(input.id);
    if (!suprimento) throw new Error('SuprimentoNotFound');
    if (suprimento.userId !== input.userId) throw new Error('SuprimentoAccessDenied');
    this.repo.delete(input.id);
  }
}
