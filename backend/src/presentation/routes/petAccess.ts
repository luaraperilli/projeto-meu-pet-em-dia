import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { SqlitePetAccessRepository } from '../../infrastructure/repositories/SqlitePetAccessRepository';
import { SqlitePetRepository } from '../../infrastructure/repositories/SqlitePetRepository';
import { SqliteUserRepository } from '../../infrastructure/repositories/SqliteUserRepository';
import { GrantPetAccess } from '../../application/petAccess/GrantPetAccess';
import { RevokePetAccess } from '../../application/petAccess/RevokePetAccess';
import { ListSharedPets } from '../../application/petAccess/ListSharedPets';

export const petAccessRouter = Router();
petAccessRouter.use(requireAuth);

petAccessRouter.get('/shared-with-me', (req: any, res) => {
  if (req.user.type !== 'Veterinário') return res.status(403).json({ message: 'Apenas veterinários' });
  try {
    const repo = new SqlitePetAccessRepository();
    const list = new ListSharedPets(repo);
    res.json(list.execute(req.user.id));
  } catch (e: any) {
    res.status(400).json({ message: e.message || 'Erro ao listar pets compartilhados' });
  }
});

petAccessRouter.get('/pet/:petId', (req: any, res) => {
  try {
    const petRepo = new SqlitePetRepository();
    const pet = petRepo.findById(Number(req.params.petId));
    if (!pet || pet.ownerId !== req.user.id) return res.status(404).json({ message: 'NotFound' });
    const accessRepo = new SqlitePetAccessRepository();
    res.json(accessRepo.listAccessByPet(pet.id!));
  } catch (e: any) {
    res.status(400).json({ message: e.message || 'Erro ao listar acessos' });
  }
});

petAccessRouter.post('/pet/:petId', (req: any, res) => {
  try {
    const accessRepo = new SqlitePetAccessRepository();
    const petRepo = new SqlitePetRepository();
    const userRepo = new SqliteUserRepository();
    const grant = new GrantPetAccess(accessRepo, petRepo, userRepo);
    const access = grant.execute({
      petId: Number(req.params.petId),
      ownerId: req.user.id,
      vetEmail: String(req.body.vetEmail || ''),
    });
    res.status(201).json(access);
  } catch (e: any) {
    const status = e.message === 'VetNotFound' || e.message === 'UserIsNotVet' ? 404 : 400;
    res.status(status).json({ message: e.message || 'Erro ao conceder acesso' });
  }
});

petAccessRouter.delete('/pet/:petId/vet/:vetUserId', (req: any, res) => {
  try {
    const accessRepo = new SqlitePetAccessRepository();
    const petRepo = new SqlitePetRepository();
    const revoke = new RevokePetAccess(accessRepo, petRepo);
    revoke.execute({
      petId: Number(req.params.petId),
      ownerId: req.user.id,
      vetUserId: Number(req.params.vetUserId),
    });
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ message: e.message || 'Erro ao revogar acesso' });
  }
});
