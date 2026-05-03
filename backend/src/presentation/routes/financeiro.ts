import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { SqliteFinanceiroRepository } from '../../infrastructure/repositories/SqliteFinanceiroRepository';
import { SqlitePetRepository } from '../../infrastructure/repositories/SqlitePetRepository';
import { CreateFinanceiro } from '../../application/financeiro/CreateFinanceiro';
import { UpdateFinanceiro } from '../../application/financeiro/UpdateFinanceiro';
import { DeleteFinanceiro } from '../../application/financeiro/DeleteFinanceiro';
import { ListFinanceiro } from '../../application/financeiro/ListFinanceiro';

export const financeiroRouter = Router();
financeiroRouter.use(requireAuth);

financeiroRouter.get('/', (req: any, res) => {
  try {
    const repo = new SqliteFinanceiroRepository();
    const list = new ListFinanceiro(repo);
    const filter = {
      petId: req.query.petId ? Number(req.query.petId) : undefined,
      categoria: typeof req.query.categoria === 'string' ? req.query.categoria : undefined,
      from: typeof req.query.from === 'string' ? req.query.from : undefined,
      to: typeof req.query.to === 'string' ? req.query.to : undefined,
    };
    const registros = list.execute({ userId: req.user.id, filter });
    res.json(registros);
  } catch (e: any) {
    res.status(400).json({ message: e.message || 'Erro ao listar registros financeiros' });
  }
});

financeiroRouter.post('/', (req: any, res) => {
  try {
    const financeiroRepo = new SqliteFinanceiroRepository();
    const petRepo = new SqlitePetRepository();
    const create = new CreateFinanceiro(financeiroRepo, petRepo);
    const registro = create.execute({
      userId: req.user.id,
      data: {
        petId: Number(req.body.petId),
        categoria: req.body.categoria,
        data: req.body.data,
        valor: Number(req.body.valor),
        observacoes: req.body.observacoes ?? null,
      },
    });
    res.status(201).json(registro);
  } catch (e: any) {
    if (e?.errors) return res.status(400).json({ message: 'ValidationError', errors: e.errors });
    res.status(400).json({ message: e.message || 'Erro ao criar registro financeiro' });
  }
});

financeiroRouter.put('/:id', (req: any, res) => {
  try {
    const financeiroRepo = new SqliteFinanceiroRepository();
    const petRepo = new SqlitePetRepository();
    const update = new UpdateFinanceiro(financeiroRepo, petRepo);
    const registro = update.execute({
      id: Number(req.params.id),
      userId: req.user.id,
      data: {
        petId: req.body.petId !== undefined ? Number(req.body.petId) : undefined,
        categoria: req.body.categoria,
        data: req.body.data,
        valor: req.body.valor !== undefined ? Number(req.body.valor) : undefined,
        observacoes: req.body.observacoes,
      },
    });
    res.json(registro);
  } catch (e: any) {
    if (e?.errors) return res.status(400).json({ message: 'ValidationError', errors: e.errors });
    res.status(400).json({ message: e.message || 'Erro ao atualizar registro financeiro' });
  }
});

financeiroRouter.delete('/:id', (req: any, res) => {
  try {
    const repo = new SqliteFinanceiroRepository();
    const del = new DeleteFinanceiro(repo);
    del.execute({ id: Number(req.params.id), userId: req.user.id });
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ message: e.message || 'Erro ao excluir registro financeiro' });
  }
});
