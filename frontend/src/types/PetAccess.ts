import { Pet } from './Pet';

export interface PetAccessGrant {
  id: number;
  petId: number;
  vetUserId: number;
  vetName: string;
  vetEmail: string;
  grantedAt: string;
}

export type SharedPet = Pet & { ownerName: string };
