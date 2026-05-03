import { PetAccess } from '../../domain/PetAccess';
import { PetAccessRepository } from '../../infrastructure/repositories/PetAccessRepository';
import { PetRepository } from '../../infrastructure/repositories/PetRepository';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';

export type GrantPetAccessInput = {
  petId: number;
  ownerId: number;
  vetEmail: string;
};

export class GrantPetAccess {
  constructor(
    private readonly accessRepo: PetAccessRepository,
    private readonly petRepo: PetRepository,
    private readonly userRepo: UserRepository,
  ) {}

  execute(input: GrantPetAccessInput): PetAccess {
    const pet = this.petRepo.findById(input.petId);
    if (!pet) throw new Error('PetNotFound');
    if (pet.ownerId !== input.ownerId) throw new Error('PetAccessDenied');

    const vet = this.userRepo.findByEmail(input.vetEmail.trim());
    if (!vet) throw new Error('VetNotFound');
    if (vet.type !== 'Veterinário') throw new Error('UserIsNotVet');

    return this.accessRepo.grant(input.petId, vet.id!);
  }
}
