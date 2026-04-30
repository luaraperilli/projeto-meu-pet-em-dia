import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import jwt from 'jsonwebtoken';
import { SqliteUserRepository } from '../../infrastructure/repositories/SqliteUserRepository';
import { CreateUser } from '../../application/CreateUser';
import { verifyPassword } from '../../application/password';

const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.bin';
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({ storage });

export const authRouter = Router();

function signToken(payload: any): string {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

function toSafeUser(u: any) {
  const { passwordHash, ...safe } = u || {};
  return safe;
}

authRouter.post(
  '/register',
  upload.fields([
    { name: 'professionalIdDoc', maxCount: 1 },
    { name: 'diplomaDoc', maxCount: 1 },
  ]),
  (req, res) => {
    try {
      const repo = new SqliteUserRepository();
      const usecase = new CreateUser(repo);
      const files = req.files as Record<string, Express.Multer.File[]> | undefined;

      const created = usecase.execute({
        name: String(req.body.name || ''),
        cpf: String(req.body.cpf || ''),
        type: req.body.type === 'Veterinário' ? 'Veterinário' : 'Tutor',
        email: String(req.body.email || ''),
        phone: String(req.body.phone || ''),
        address: req.body.address ? String(req.body.address) : null,
        password: String(req.body.password || ''),
        crmv: req.body.crmv ? String(req.body.crmv) : null,
        clinicAddress: req.body.clinicAddress ? String(req.body.clinicAddress) : null,
        professionalIdDocPath: files?.professionalIdDoc?.[0]?.filename
          ? `/uploads/${files.professionalIdDoc[0].filename}`
          : null,
        diplomaDocPath: files?.diplomaDoc?.[0]?.filename ? `/uploads/${files.diplomaDoc[0].filename}` : null,
      });

      const token = signToken({ id: created.id, role: created.role });
      return res.status(201).json({ user: toSafeUser(created), token });
    } catch (e: any) {
      if (e?.errors) {
        const errorMessages = Object.entries(e.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join('; ');
        return res.status(400).json({ message: errorMessages, errors: e.errors });
      }
      return res.status(500).json({ message: 'Erro interno ao criar usuário' });
    }
  },
);

authRouter.post('/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    const repo = new SqliteUserRepository();
    const u = repo.findByEmail(String(email || ''));
    if (!u || !verifyPassword(String(password || ''), u.passwordHash)) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    const token = signToken({ id: u.id, role: u.role });
    return res.json({ user: toSafeUser(u), token });
  } catch {
    return res.status(500).json({ message: 'InternalError' });
  }
});

authRouter.get('/me', (req, res) => {
  try {
    const auth = req.header('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const payload = jwt.verify(token, secret) as any;
    const repo = new SqliteUserRepository();
    const u = repo.findById(Number(payload.id));
    if (!u) return res.status(401).json({ message: 'Unauthorized' });
    return res.json({ user: toSafeUser(u) });
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
});
