import { Pet } from '../../domain/Pet';
import { PetAccessRepository } from '../../infrastructure/repositories/PetAccessRepository';

export class ListSharedPets {
  constructor(private readonly accessRepo: PetAccessRepository) {}

  execute(vetUserId: number): Array<Pet & { ownerName: string }> {
    return this.accessRepo.listPetsSharedWithVet(vetUserId);
  }
}
