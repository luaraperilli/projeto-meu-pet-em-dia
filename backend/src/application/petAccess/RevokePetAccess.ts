import { PetAccessRepository } from '../../infrastructure/repositories/PetAccessRepository';
import { PetRepository } from '../../infrastructure/repositories/PetRepository';

export type RevokePetAccessInput = {
  petId: number;
  ownerId: number;
  vetUserId: number;
};

export class RevokePetAccess {
  constructor(
    private readonly accessRepo: PetAccessRepository,
    private readonly petRepo: PetRepository,
  ) {}

  execute(input: RevokePetAccessInput): void {
    const pet = this.petRepo.findById(input.petId);
    if (!pet) throw new Error('PetNotFound');
    if (pet.ownerId !== input.ownerId) throw new Error('PetAccessDenied');
    this.accessRepo.revoke(input.petId, input.vetUserId);
  }
}
