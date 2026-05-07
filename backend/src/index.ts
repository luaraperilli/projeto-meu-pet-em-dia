import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { authRouter } from './presentation/routes/auth';
import { petsRouter } from './presentation/routes/pets';
import { agendaRouter } from './presentation/routes/agenda';
import { registrosSaudeRouter } from './presentation/routes/registroSaude';
import { notificacoesRouter } from './presentation/routes/notificacao';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.use('/auth', authRouter);
app.use('/pets', petsRouter);
app.use('/agenda', agendaRouter);
app.use('/registros_saude', registrosSaudeRouter);
app.use('/notificacoes', notificacoesRouter);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR] Unhandled error:', err?.stack || err);
  res.status(500).json({ message: 'InternalError' });
});

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
