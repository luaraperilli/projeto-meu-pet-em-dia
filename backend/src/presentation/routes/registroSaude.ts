import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { requireAuth } from '../middleware/auth';
import { SqliteRegistroSaudeRepository } from '../../infrastructure/repositories/SqliteRegistroSaudeRepository';
import { SqlitePetRepository } from '../../infrastructure/repositories/SqlitePetRepository';
import { SqlitePetAccessRepository } from '../../infrastructure/repositories/SqlitePetAccessRepository';
import { CreateRegistroSaude } from '../../application/registroSaude/CreateRegistroSaude';
import { UpdateRegistroSaude } from '../../application/registroSaude/UpdateRegistroSaude';
import { DeleteRegistroSaude } from '../../application/registroSaude/DeleteRegistroSaude';
import { ListRegistroSaude } from '../../application/registroSaude/ListRegistroSaude';

const UPLOADS_BASE_DIR = path.resolve(process.cwd(), 'uploads');
const REGISTROS_DIR = path.join(UPLOADS_BASE_DIR, 'registros');

if (!fs.existsSync(REGISTROS_DIR)) fs.mkdirSync(REGISTROS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, REGISTROS_DIR),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `registro-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF, PNG, JPG e JPEG são permitidos'));
    }
  },
});

export const registrosSaudeRouter = Router();
registrosSaudeRouter.use(requireAuth);

registrosSaudeRouter.get('/', (req: any, res) => {
  try {
    const registroRepo = new SqliteRegistroSaudeRepository();
    const list = new ListRegistroSaude(registroRepo);
    const registros = list.execute({ userId: req.user.id, userType: req.user.type });
    res.json(registros);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao buscar registros de saúde' });
  }
});

registrosSaudeRouter.post('/', upload.single('file'), (req: any, res) => {
  try {
    const registroRepo = new SqliteRegistroSaudeRepository();
    const petRepo = new SqlitePetRepository();
    const accessRepo = new SqlitePetAccessRepository();
    const create = new CreateRegistroSaude(registroRepo, petRepo, accessRepo);

    const file = req.file;
    const body = req.body;
    const finalFilePath = file ? `/uploads/registros/${file.filename}` : null;

    const novoRegistro = create.execute({
      userId: req.user.id,
      userType: req.user.type,
      data: {
        petId: Number(body.petId),
        tipoRegistro: body.tipoRegistro,
        data: body.data,
        horario: body.horario,
        profissional: body.profissional,
        filePath: finalFilePath,
        fileData: null,
      },
    } as any);
    res.status(201).json(novoRegistro);
  } catch (error: any) {
    if (req.file) fs.unlinkSync(req.file.path);
    if (error?.message?.includes('Apenas arquivos')) return res.status(400).json({ message: error.message });
    if (error?.errors) return res.status(400).json({ message: 'ValidationError', errors: error.errors });
    res.status(400).json({ message: error.message || 'Erro ao cadastrar registro de saúde' });
  }
});

registrosSaudeRouter.put('/:id', upload.single('file'), (req: any, res) => {
  try {
    const registroRepo = new SqliteRegistroSaudeRepository();
    const petRepo = new SqlitePetRepository();
    const accessRepo = new SqlitePetAccessRepository();
    const update = new UpdateRegistroSaude(registroRepo, petRepo, accessRepo);

    const file = req.file;
    const body = req.body;
    const filePath = file ? `/uploads/registros/${file.filename}` : body.filePath || null;

    const registroAtualizado = update.execute({
      registroId: Number(req.params.id),
      userId: req.user.id,
      userType: req.user.type,
      data: {
        data: body.data,
        horario: body.horario,
        profissional: body.profissional,
        filePath,
      },
    } as any);
    res.json(registroAtualizado);
  } catch (error: any) {
    if (req.file) fs.unlinkSync(req.file.path);
    if (error?.errors) return res.status(400).json({ message: 'ValidationError', errors: error.errors });
    res.status(400).json({ message: error.message || 'Erro ao atualizar registro de saúde' });
  }
});

registrosSaudeRouter.delete('/:id', (req: any, res) => {
  try {
    const registroRepo = new SqliteRegistroSaudeRepository();
    const petRepo = new SqlitePetRepository();
    const accessRepo = new SqlitePetAccessRepository();
    const del = new DeleteRegistroSaude(registroRepo, petRepo, accessRepo);
    del.execute({
      registroId: Number(req.params.id),
      userId: req.user.id,
      userType: req.user.type,
    });
    res.status(204).send();
  } catch (error: any) {
    res.status(403).json({ message: error.message || 'Ação não permitida para este registro.' });
  }
});
