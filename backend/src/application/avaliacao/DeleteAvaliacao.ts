import { AvaliacaoRepository } from '../../infrastructure/repositories/AvaliacaoRepository';

export type DeleteAvaliacaoInput = {
  id: number;
  userId: number;
};

export class DeleteAvaliacao {
  constructor(private readonly repo: AvaliacaoRepository) {}

  execute(input: DeleteAvaliacaoInput): void {
    const avaliacao = this.repo.findById(input.id);
    if (!avaliacao) throw new Error('AvaliacaoNotFound');
    if (avaliacao.userId !== input.userId) throw new Error('AvaliacaoAccessDenied');
    this.repo.delete(input.id);
  }
}
