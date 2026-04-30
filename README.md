# 🐾 Meu Pet em Dia

Sistema fullstack de gestão de saúde para pets, conectando tutores e veterinários.

## Funcionalidades

- Autenticação JWT com perfis **Tutor** e **Veterinário**
- Cadastro de pets com foto e dados clínicos
- Agenda de consultas, vacinas e procedimentos
- Registros de saúde com anexos (PDF, imagens)
- Painel administrativo de usuários (protegido por `x-admin-key`)
- Validações brasileiras de CPF e celular
- UI responsiva (desktop, tablet, mobile)

## Stack

**Frontend:** React 18 + TypeScript, Vite, React Router, React Hook Form. Estilos via CSS variables + inline (sem framework de UI).

**Backend:** Node.js + Express + TypeScript, SQLite (`better-sqlite3`), JWT, PBKDF2 para hash de senha, Multer para uploads.

**Arquitetura:** Domain-Driven Design em 4 camadas — `domain/` (entidades), `application/` (casos de uso), `infrastructure/` (repositórios SQLite), `presentation/` (rotas Express + middleware).

## Estrutura

```
projeto-meu-pet-em-dia/
├── backend/
│   ├── src/
│   │   ├── domain/                # Entidades: User, Pet, Agenda, RegistroSaude
│   │   ├── application/           # Casos de uso por entidade
│   │   ├── infrastructure/        # db.ts (schema SQLite) + repositories/
│   │   ├── presentation/          # routes/ + middleware/auth.ts
│   │   ├── scripts/seedAdmin.ts   # Cria usuário admin inicial
│   │   └── index.ts               # Entry point
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/        # Forms, Lists, Modals, Navbar, Toast
│   │   │   ├── providers/         # AuthProvider (Context API)
│   │   │   └── routes/            # AppRoutes
│   │   ├── lib/api.ts             # API_BASE_URL, ADMIN_KEY
│   │   ├── types/                 # Tipos espelhados do domain do backend
│   │   ├── utils/                 # Máscaras de CPF/telefone
│   │   └── styles/global.css      # CSS variables (cores, tipografia)
│   └── .env.example
│
├── testes/                        # E2E com Selenium (Python)
├── documentation/                 # Guias arquitetural e de implementação
└── docker-compose.yml
```

## Como Rodar

Pré-requisito: Node.js 18+.

### Backend

```bash
cd backend
cp .env.example .env             # ajuste JWT_SECRET e ADMIN_KEY
npm install
npm run dev                      # http://localhost:3001
npm run seed:admin               # opcional: cria admin@gmail.com / Modejudu@33
```

### Frontend

```bash
cd frontend
cp .env.example .env.local       # ajuste VITE_ADMIN_KEY se mudou no backend
npm install
npm run dev                      # http://localhost:5173
```

### Formatação

Prettier configurado na raiz. Em qualquer subpasta:

```bash
npm run format                   # aplica
npm run format:check             # apenas verifica
```

## Endpoints

Rotas autenticadas exigem `Authorization: Bearer <token>`. Rotas `/admin/*` exigem `x-admin-key`.

| Recurso             | Métodos                                                                  |
| ------------------- | ------------------------------------------------------------------------ |
| `/auth`             | `POST /register`, `POST /login`, `GET /me`                              |
| `/admin/users`      | `POST`, `GET` (filtros: `type`, `q`), `GET /:id`, `PUT /:id`, `DELETE /:id` |
| `/pets`             | `GET` (filtros: `name`, `species`), `POST`, `PUT /:id`, `DELETE /:id`   |
| `/agenda`           | `GET`, `GET /pet/:petId`, `POST`, `PUT /:id`, `DELETE /:id`             |
| `/registros_saude`  | `GET`, `POST` (multipart), `PUT /:id`, `DELETE /:id`                    |
| `/health`           | `GET` — healthcheck                                                     |
| `/uploads/*`        | Arquivos estáticos (fotos de pets, anexos de registros)                 |

## Banco de Dados

SQLite local em `backend/data/app.db` (criado automaticamente no primeiro boot). Schema completo em [backend/src/infrastructure/db.ts](backend/src/infrastructure/db.ts).

Tabelas: `users`, `pets` (FK → users), `agenda` (FK → pets), `registros_saude` (FK → pets, users). Todas com `ON DELETE CASCADE` para manter integridade.

## Validações

- **Nome / Raça / Anotações**: 3–100 caracteres
- **Email**: 10–256 caracteres
- **CPF**: 11 dígitos, formatado como `000.000.000-00`
- **Celular**: `(00) 00000-0000`
- **Senha**: 8–12 chars, ≥1 maiúscula, ≥1 número, ≥1 caractere especial
- **Anexo de registro de saúde**: PDF/PNG/JPG, máx 5MB

Implementação em [backend/src/application/validators.ts](backend/src/application/validators.ts).

## Docker

```bash
docker compose up -d --build
# Frontend: http://localhost:8088   Backend: http://localhost:3001
```

Se o frontend servir em branco após mudanças, faça rebuild sem cache:

```bash
docker compose down
docker compose build --no-cache frontend
docker compose up -d
```

## Testes E2E (Selenium)

Em [testes/](testes/). Para rodar com janela visível e delay entre ações:

```powershell
cd testes
$env:MEUPET_HEADLESS='0'; $env:MEUPET_E2E_DELAY='1'
.\run.ps1                                  # todos
python .\test_pets_flow.py                 # individual
```

## Segurança

- Hash de senha: **PBKDF2** com 10.000 iterações, salt aleatório de 16 bytes, SHA-512
- JWT com expiração de 7 dias (segredo via `JWT_SECRET`)
- Rotas administrativas protegidas por `x-admin-key`
- Upload limitado a 5MB

## Documentação Adicional

- [Guia de Arquitetura](documentation/GUIA_ARQUITETURAL.md)
- [Guia de Implementação](documentation/GUIA_IMPLEMENTACAO.md)

## Licença

MIT.
