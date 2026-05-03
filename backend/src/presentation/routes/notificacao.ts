import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { ListarNotificacoes } from '../../application/notificacao/ListarNotificacoes';

export const notificacoesRouter = Router();
notificacoesRouter.use(requireAuth);

notificacoesRouter.get('/', (req: any, res) => {
  try {
    const usecase = new ListarNotificacoes();
    res.json(usecase.execute(req.user.id));
  } catch (e: any) {
    res.status(400).json({ message: e.message || 'Erro ao listar notificações' });
  }
});
