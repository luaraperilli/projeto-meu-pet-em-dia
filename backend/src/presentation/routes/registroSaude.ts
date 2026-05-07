import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { SqliteRegistroSaudeRepository } from '../../infrastructure/repositories/SqliteRegistroSaudeRepository';
import { SqlitePetRepository } from '../../infrastructure/repositories/SqlitePetRepository';
import { CreateRegistroSaude } from '../../application/registroSaude/CreateRegistroSaude';
import { UpdateRegistroSaude } from '../../application/registroSaude/UpdateRegistroSaude';
import { DeleteRegistroSaude } from '../../application/registroSaude/DeleteRegistroSaude';
import { ListRegistroSaude } from '../../application/registroSaude/ListRegistroSaude';

export const registrosSaudeRouter = Router();
registrosSaudeRouter.use(requireAuth);

registrosSaudeRouter.get('/', (req: any, res) => {
  try {
    const registroRepo = new SqliteRegistroSaudeRepository();
    const list = new ListRegistroSaude(registroRepo);
    res.json(list.execute({ userId: req.user.id }));
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao buscar registros de saúde' });
  }
});

registrosSaudeRouter.post('/', (req: any, res) => {
  try {
    const registroRepo = new SqliteRegistroSaudeRepository();
    const petRepo = new SqlitePetRepository();
    const create = new CreateRegistroSaude(registroRepo, petRepo);

    const body = req.body;

    const novoRegistro = create.execute({
      userId: req.user.id,
      data: {
        petId: Number(body.petId),
        tipoRegistro: body.tipoRegistro,
        data: body.data,
        horario: body.horario,
        profissional: body.profissional,
      },
    });
    res.status(201).json(novoRegistro);
  } catch (error: any) {
    if (error?.errors) return res.status(400).json({ message: 'ValidationError', errors: error.errors });
    res.status(400).json({ message: error.message || 'Erro ao cadastrar registro de saúde' });
  }
});

registrosSaudeRouter.put('/:id', (req: any, res) => {
  try {
    const registroRepo = new SqliteRegistroSaudeRepository();
    const petRepo = new SqlitePetRepository();
    const update = new UpdateRegistroSaude(registroRepo, petRepo);

    const body = req.body;

    const registroAtualizado = update.execute({
      registroId: Number(req.params.id),
      userId: req.user.id,
      data: {
        data: body.data,
        horario: body.horario,
        profissional: body.profissional,
      },
    });
    res.json(registroAtualizado);
  } catch (error: any) {
    if (error?.errors) return res.status(400).json({ message: 'ValidationError', errors: error.errors });
    res.status(400).json({ message: error.message || 'Erro ao atualizar registro de saúde' });
  }
});

registrosSaudeRouter.delete('/:id', (req: any, res) => {
  try {
    const registroRepo = new SqliteRegistroSaudeRepository();
    const petRepo = new SqlitePetRepository();
    const del = new DeleteRegistroSaude(registroRepo, petRepo);
    del.execute({
      registroId: Number(req.params.id),
      userId: req.user.id,
    });
    res.status(204).send();
  } catch (error: any) {
    res.status(403).json({ message: error.message || 'Ação não permitida para este registro.' });
  }
});
