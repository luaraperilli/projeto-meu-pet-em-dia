import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { SqliteSuprimentoRepository } from '../../infrastructure/repositories/SqliteSuprimentoRepository';
import { SqlitePetRepository } from '../../infrastructure/repositories/SqlitePetRepository';
import { CreateSuprimento } from '../../application/suprimento/CreateSuprimento';
import { UpdateSuprimento } from '../../application/suprimento/UpdateSuprimento';
import { DeleteSuprimento } from '../../application/suprimento/DeleteSuprimento';
import { ListSuprimento } from '../../application/suprimento/ListSuprimento';

export const suprimentosRouter = Router();
suprimentosRouter.use(requireAuth);

suprimentosRouter.get('/', (req: any, res) => {
  try {
    const repo = new SqliteSuprimentoRepository();
    const list = new ListSuprimento(repo);
    res.json(list.execute(req.user.id));
  } catch (e: any) {
    res.status(400).json({ message: e.message || 'Erro ao listar suprimentos' });
  }
});

suprimentosRouter.post('/', (req: any, res) => {
  try {
    const suprimentoRepo = new SqliteSuprimentoRepository();
    const petRepo = new SqlitePetRepository();
    const create = new CreateSuprimento(suprimentoRepo, petRepo);
    const suprimento = create.execute({
      userId: req.user.id,
      data: {
        petId: req.body.petId ? Number(req.body.petId) : null,
        nome: String(req.body.nome || ''),
        categoria: req.body.categoria,
        quantidade: Number(req.body.quantidade),
        unidade: String(req.body.unidade || ''),
        consumoDiario: req.body.consumoDiario !== '' && req.body.consumoDiario != null ? Number(req.body.consumoDiario) : null,
        diasAlerta: Number(req.body.diasAlerta ?? 7),
      },
    });
    res.status(201).json(suprimento);
  } catch (e: any) {
    if (e?.errors) return res.status(400).json({ message: 'ValidationError', errors: e.errors });
    res.status(400).json({ message: e.message || 'Erro ao criar suprimento' });
  }
});

suprimentosRouter.put('/:id', (req: any, res) => {
  try {
    const suprimentoRepo = new SqliteSuprimentoRepository();
    const petRepo = new SqlitePetRepository();
    const update = new UpdateSuprimento(suprimentoRepo, petRepo);
    const suprimento = update.execute({
      id: Number(req.params.id),
      userId: req.user.id,
      data: {
        petId: req.body.petId !== undefined ? (req.body.petId ? Number(req.body.petId) : null) : undefined,
        nome: req.body.nome,
        categoria: req.body.categoria,
        quantidade: req.body.quantidade !== undefined ? Number(req.body.quantidade) : undefined,
        unidade: req.body.unidade,
        consumoDiario:
          req.body.consumoDiario !== undefined
            ? req.body.consumoDiario !== '' && req.body.consumoDiario != null
              ? Number(req.body.consumoDiario)
              : null
            : undefined,
        diasAlerta: req.body.diasAlerta !== undefined ? Number(req.body.diasAlerta) : undefined,
      },
    });
    res.json(suprimento);
  } catch (e: any) {
    if (e?.errors) return res.status(400).json({ message: 'ValidationError', errors: e.errors });
    res.status(400).json({ message: e.message || 'Erro ao atualizar suprimento' });
  }
});

suprimentosRouter.delete('/:id', (req: any, res) => {
  try {
    const repo = new SqliteSuprimentoRepository();
    const del = new DeleteSuprimento(repo);
    del.execute({ id: Number(req.params.id), userId: req.user.id });
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ message: e.message || 'Erro ao excluir suprimento' });
  }
});
