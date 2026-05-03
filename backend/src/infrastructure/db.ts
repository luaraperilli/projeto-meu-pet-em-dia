import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'app.db');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('Tutor','Veterinário')) DEFAULT 'Tutor',
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    passwordHash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin','user')) DEFAULT 'user',
    crmv TEXT,
    clinicAddress TEXT,
    professionalIdDocPath TEXT,
    diplomaDocPath TEXT,
    createdAt TEXT NOT NULL DEFAULT (DATETIME('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);

  CREATE TABLE IF NOT EXISTS pets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ownerId INTEGER NOT NULL,
    name TEXT NOT NULL,
    species TEXT NOT NULL CHECK (species IN ('Cachorro','Cavalo','Gato','Outros')),
    breed TEXT,
    sex TEXT CHECK (sex IN ('Macho','Fêmea','Irrelevante')),
    age INTEGER,
    weight REAL,
    height REAL,
    notes TEXT,
    photoPath TEXT,
    createdAt TEXT NOT NULL DEFAULT (DATETIME('now')),
    FOREIGN KEY(ownerId) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_pets_owner ON pets(ownerId);
  CREATE INDEX IF NOT EXISTS idx_pets_created ON pets(createdAt DESC);

  CREATE TABLE IF NOT EXISTS agenda (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    petId INTEGER NOT NULL,
    procedimento TEXT NOT NULL CHECK (procedimento IN ('Banho/Tosa','Vacina','Vermifugo','Antipulgas','Consulta','Outros')),
    data TEXT NOT NULL,
    horario TEXT NOT NULL,
    profissional TEXT,
    observacoes TEXT,
    createdAt TEXT NOT NULL DEFAULT (DATETIME('now')),
    FOREIGN KEY(petId) REFERENCES pets(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS registros_saude (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    petId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    tipoRegistro TEXT NOT NULL CHECK (tipoRegistro IN ('Vacina', 'Cirurgia', 'Exame', 'Observação')),
    data TEXT NOT NULL,
    horario TEXT NOT NULL,
    profissional TEXT NOT NULL,
    filePath TEXT,
    createdAt TEXT NOT NULL DEFAULT (DATETIME('now')),
    FOREIGN KEY(petId) REFERENCES pets(id) ON DELETE CASCADE,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_registros_pet ON registros_saude(petId);
  CREATE INDEX IF NOT EXISTS idx_registros_data ON registros_saude(data DESC, horario DESC);

  CREATE TABLE IF NOT EXISTS financeiro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    petId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('Consulta','Vacina','Medicamento','Exame','Suprimento','Outros')),
    data TEXT NOT NULL,
    valor REAL NOT NULL,
    observacoes TEXT,
    createdAt TEXT NOT NULL DEFAULT (DATETIME('now')),
    FOREIGN KEY(petId) REFERENCES pets(id) ON DELETE CASCADE,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_financeiro_user ON financeiro(userId);
  CREATE INDEX IF NOT EXISTS idx_financeiro_data ON financeiro(data DESC);

  CREATE TABLE IF NOT EXISTS suprimentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    petId INTEGER,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('Ração','Medicamento','Higiene','Acessório','Outros')),
    quantidade REAL NOT NULL,
    unidade TEXT NOT NULL,
    consumoDiario REAL,
    diasAlerta INTEGER NOT NULL DEFAULT 7,
    createdAt TEXT NOT NULL DEFAULT (DATETIME('now')),
    updatedAt TEXT NOT NULL DEFAULT (DATETIME('now')),
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(petId) REFERENCES pets(id) ON DELETE SET NULL
  );
  CREATE INDEX IF NOT EXISTS idx_suprimentos_user ON suprimentos(userId);

  CREATE TABLE IF NOT EXISTS avaliacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    profissional TEXT NOT NULL,
    servico TEXT NOT NULL,
    nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    data TEXT NOT NULL DEFAULT (DATE('now')),
    createdAt TEXT NOT NULL DEFAULT (DATETIME('now')),
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_avaliacoes_profissional ON avaliacoes(profissional);

  CREATE TABLE IF NOT EXISTS pet_access (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    petId INTEGER NOT NULL,
    vetUserId INTEGER NOT NULL,
    grantedAt TEXT NOT NULL DEFAULT (DATETIME('now')),
    UNIQUE(petId, vetUserId),
    FOREIGN KEY(petId) REFERENCES pets(id) ON DELETE CASCADE,
    FOREIGN KEY(vetUserId) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_pet_access_vet ON pet_access(vetUserId);

  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expiresAt TEXT NOT NULL,
    usedAt TEXT,
    createdAt TEXT NOT NULL DEFAULT (DATETIME('now')),
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_reset_token ON password_reset_tokens(token);
`);

