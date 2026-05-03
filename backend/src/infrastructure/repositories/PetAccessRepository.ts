import { PetAccess } from '../../domain/PetAccess';
import { Pet } from '../../domain/Pet';

export interface PetAccessRepository {
  grant(petId: number, vetUserId: number): PetAccess;
  revoke(petId: number, vetUserId: number): void;
  hasAccess(petId: number, vetUserId: number): boolean;
  listAccessByPet(petId: number): Array<PetAccess & { vetName: string; vetEmail: string }>;
  listPetsSharedWithVet(vetUserId: number): Array<Pet & { ownerName: string }>;
}
