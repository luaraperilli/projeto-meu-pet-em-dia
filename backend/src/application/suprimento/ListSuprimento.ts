import { Suprimento } from '../../domain/Suprimento';
import { SuprimentoRepository } from '../../infrastructure/repositories/SuprimentoRepository';

export class ListSuprimento {
  constructor(private readonly repo: SuprimentoRepository) {}

  execute(userId: number): Suprimento[] {
    return this.repo.findAllByOwner(userId);
  }
}
