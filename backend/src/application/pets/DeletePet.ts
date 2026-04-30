import { PetRepository } from '../../infrastructure/repositories/PetRepository';

export class DeletePet {
  constructor(private readonly repo: PetRepository) {}

  execute(id: number): void {
    const existing = this.repo.findById(id);
    if (!existing) throw new Error('NotFound');
    this.repo.delete(id);
  }
}
