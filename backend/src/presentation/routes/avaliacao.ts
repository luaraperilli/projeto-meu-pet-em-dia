import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { SqliteAvaliacaoRepository } from '../../infrastructure/repositories/SqliteAvaliacaoRepository';
import { CreateAvaliacao } from '../../application/avaliacao/CreateAvaliacao';
import { UpdateAvaliacao } from '../../application/avaliacao/UpdateAvaliacao';
import { DeleteAvaliacao } from '../../application/avaliacao/DeleteAvaliacao';
import { ListAvaliacao } from '../../application/avaliacao/ListAvaliacao';

export const avaliacoesRouter = Router();
avaliacoesRouter.use(requireAuth);

avaliacoesRouter.get('/', (req, res) => {
  try {
    const repo = new SqliteAvaliacaoRepository();
    const list = new ListAvaliacao(repo);
    const filter = {
      profissional: typeof req.query.profissional === 'string' ? req.query.profissional : undefined,
      servico: typeof req.query.servico === 'string' ? req.query.servico : undefined,
      nota: req.query.nota ? Number(req.query.nota) : undefined,
    };
    res.json(list.execute({ filter }));
  } catch (e: any) {
    res.status(400).json({ message: e.message || 'Erro ao listar avaliações' });
  }
});

avaliacoesRouter.post('/', (req: any, res) => {
  try {
    const repo = new SqliteAvaliacaoRepository();
    const create = new CreateAvaliacao(repo);
    const avaliacao = create.execute({
      userId: req.user.id,
      data: {
        profissional: String(req.body.profissional || ''),
        servico: String(req.body.servico || ''),
        nota: Number(req.body.nota),
        comentario: req.body.comentario ?? null,
      },
    });
    res.status(201).json(avaliacao);
  } catch (e: any) {
    if (e?.errors) return res.status(400).json({ message: 'ValidationError', errors: e.errors });
    res.status(400).json({ message: e.message || 'Erro ao criar avaliação' });
  }
});

avaliacoesRouter.put('/:id', (req: any, res) => {
  try {
    const repo = new SqliteAvaliacaoRepository();
    const update = new UpdateAvaliacao(repo);
    const avaliacao = update.execute({
      id: Number(req.params.id),
      userId: req.user.id,
      data: {
        profissional: req.body.profissional,
        servico: req.body.servico,
        nota: req.body.nota !== undefined ? Number(req.body.nota) : undefined,
        comentario: req.body.comentario,
      },
    });
    res.json(avaliacao);
  } catch (e: any) {
    if (e?.errors) return res.status(400).json({ message: 'ValidationError', errors: e.errors });
    res.status(400).json({ message: e.message || 'Erro ao atualizar avaliação' });
  }
});

avaliacoesRouter.delete('/:id', (req: any, res) => {
  try {
    const repo = new SqliteAvaliacaoRepository();
    const del = new DeleteAvaliacao(repo);
    del.execute({ id: Number(req.params.id), userId: req.user.id });
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ message: e.message || 'Erro ao excluir avaliação' });
  }
});
