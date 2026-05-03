# 🐾 Meu Pet em Dia

Sistema fullstack de gestão de saúde para pets, conectando tutores e veterinários — implementação alinhada ao [Planejamento SCRUM](documentation/) do Grupo 8 (Desenvolvimento de Sistemas Web — UNIFEI 2026.1).

## Funcionalidades

**Cadastro & autenticação** (RF1)

- Registro de tutores e veterinários (com CRMV + documentos)
- Login JWT, edição do próprio perfil, exclusão de conta (LGPD)
- Recuperação de senha por email (token de 1h)
- Aceite de Termos/Política de Privacidade no cadastro

**Pets, Agenda e Saúde** (RF2-RF4)

- CRUD de pets com foto
- Agenda de consultas, vacinas, banhos, vermífugos
- Registros de saúde com upload de exames (PDF/PNG/JPG)
- **Compartilhamento controlado:** tutor concede acesso a vet por email; vet vê pets compartilhados

**Financeiro** (RF5)

- Registro de gastos por categoria (Consulta, Vacina, Medicamento, Exame, Suprimento, Outros)
- Filtros por categoria, total automático

**Estoque** (RF6)

- Cadastro de suprimentos (ração, medicamentos, etc) com quantidade, unidade e consumo diário
- Cálculo automático de dias restantes e alerta quando próximo da reposição

**Relatórios** (RF7)

- Relatório de saúde por pet/período (registros + agenda)
- Relatório de gastos por período (total, por categoria, por pet)
- **Exportação em PDF** (via `pdfkit`)

**Avaliações** (RF8)

- Avaliação de profissionais (1-5 estrelas + comentário)
- Listagem pública com filtros (profissional, nota)

**Notificações** (RF3.3 + RF6.2)

- Notificações in-app (sininho com badge no navbar)
- Compromissos próximos (próximos 7 dias) e suprimentos próximos da reposição
- Atualização automática a cada 60s

**Admin** (RF9)

- CRUD de usuários protegido por `x-admin-key`

## Stack

- **Frontend:** React 18 + TypeScript, Vite, React Router, React Hook Form. CSS variables + estilos inline
- **Backend:** Node.js + Express + TypeScript, SQLite (`better-sqlite3`), JWT, **Bcrypt** para hash de senha (RNF1.1), Multer para uploads, `pdfkit` para relatórios
- **Arquitetura:** DDD em 4 camadas — `domain/` (entidades), `application/` (casos de uso), `infrastructure/` (repositórios SQLite), `presentation/` (rotas Express)

## Estrutura

```
projeto-meu-pet-em-dia/
├── backend/
│   ├── src/
│   │   ├── domain/                # User, Pet, Agenda, RegistroSaude, Financeiro, Suprimento,
│   │   │                          # Avaliacao, PetAccess, PasswordResetToken
│   │   ├── application/           # Casos de uso por entidade (CreateXxx, UpdateXxx, etc)
│   │   │   ├── auth/              # RequestPasswordReset, ConfirmPasswordReset
│   │   │   ├── relatorios/        # GerarRelatorioSaude, GerarRelatorioGastos
│   │   │   └── notificacao/       # ListarNotificacoes
│   │   ├── infrastructure/        # db.ts (schema SQLite) + repositories/
│   │   ├── presentation/          # routes/ + middleware/auth.ts
│   │   ├── scripts/seed.ts        # Cria 3 usuários de teste
│   │   └── index.ts
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/        # Forms, Lists, Modals, Pages para cada entidade
│   │   │   ├── providers/         # AuthProvider
│   │   │   └── routes/AppRoutes.tsx
│   │   ├── lib/api.ts
│   │   ├── types/                 # Tipos espelhados do backend
│   │   ├── utils/                 # Máscaras de CPF/telefone
│   │   └── styles/global.css
│   └── .env.example
│
├── testes/                        # E2E Selenium (Python)
├── documentation/                 # Planejamento SCRUM, guias arquiteturais
└── docker-compose.yml
```

## 🚀 Como Rodar Localmente

> Para colegas do grupo: siga esses passos do zero. Vai precisar de **2 terminais** (um pro backend, um pro frontend) rodando ao mesmo tempo.

### Pré-requisitos

- **Node.js 18+** ([download](https://nodejs.org/))
- **Git**
- (Opcional) Docker Desktop — só se quiser rodar com `docker compose` em vez de npm

### 1. Clone e entre na pasta

```powershell
git clone https://github.com/luaraperilli/projeto-meu-pet-em-dia.git
cd projeto-meu-pet-em-dia
```

### 2. Terminal 1 — Backend

```powershell
cd backend
cp .env.example .env             # ou copie manualmente; valores default funcionam pra dev local
npm install                      # 2-3 min (compila better-sqlite3 nativo)
npm run seed                     # cria os 3 usuários de teste
npm run dev                      # API em http://localhost:3001
```

Deixe esse terminal rodando.

### 3. Terminal 2 — Frontend

```powershell
cd frontend
cp .env.example .env.local       # default já aponta pro backend local
npm install                      # 1-2 min
npm run dev                      # UI em http://localhost:5173
```

Abra http://localhost:5173 no navegador.

### 👥 Usuários de teste

Após `npm run seed`, esses 3 usuários ficam disponíveis. Senha de todos: **`Teste@123`**

| Email | Perfil | Role | O que testar |
|---|---|---|---|
| `admin@test.com` | Tutor | **admin** | Todas as funcionalidades do tutor + painel "Gerenciar Usuários" |
| `tutor@test.com` | Tutor | user | Pets, Agenda, Saúde, Financeiro, Estoque, Avaliações, Relatórios |
| `vet@test.com` | Veterinário | user | Acessa pets compartilhados pelo tutor + edita registros de saúde deles |

> 💡 **Pra testar o fluxo Tutor↔Vet:** logue como `tutor@test.com`, vá em **Meus Pets**, clique no botão 🔐 (Gerenciar acessos) de um pet, conceda acesso a `vet@test.com`. Deslogue e logue como vet — você verá o pet em "Pets Compartilhados" e poderá criar registros de saúde nele.

### Problemas comuns

| Problema | Solução |
|---|---|
| `bcrypt` não verifica senhas antigas (você tinha o app.db anterior) | Apague `backend/data/app.db*` e rode `npm run seed` de novo |
| Porta 3001 ou 5173 ocupada | Mate o processo: `netstat -ano \| findstr :3001` → `taskkill /PID <pid> /F` |
| `better-sqlite3` falha no `npm install` (Windows) | Instale build tools: `npm install --global windows-build-tools` (admin) |
| Erro de senha ao logar com novos usuários | Confirma se rodou `npm run seed` no backend |
| IDE mostra erros de TS que não aparecem em `npm run dev` | Reinicia o TS Server: `Ctrl+Shift+P` → "TypeScript: Restart TS Server" |

### Comandos úteis

```powershell
# Backend
npm run dev                      # dev server com hot-reload
npm run build                    # build pra produção
npm run start                    # roda o build
npm run seed                     # recria usuários de teste
npm run format                   # aplica Prettier

# Frontend
npm run dev                      # dev server Vite
npm run build                    # build pra produção
npm run preview                  # serve o build
npm run typecheck                # tsc --noEmit
npm run format                   # aplica Prettier
```

### Alternativa: Docker

Se preferir rodar tudo num comando só (precisa do Docker Desktop aberto):

```powershell
docker compose up -d --build
# Frontend: http://localhost:8088   Backend: http://localhost:3001
```

## Endpoints

Rotas autenticadas exigem `Authorization: Bearer <token>`. Rotas `/admin/*` exigem `x-admin-key`.

| Recurso              | Métodos principais                                                                  |
| -------------------- | ----------------------------------------------------------------------------------- |
| `/auth`              | `POST /register`, `POST /login`, `GET/PUT/DELETE /me`, `POST /forgot-password`, `POST /reset-password` |
| `/admin/users`       | `POST`, `GET` (filtros: `type`, `q`), `GET /:id`, `PUT /:id`, `DELETE /:id`         |
| `/pets`              | `GET`, `POST`, `PUT /:id`, `DELETE /:id`                                            |
| `/agenda`            | `GET`, `GET /pet/:petId`, `POST`, `PUT /:id`, `DELETE /:id`                         |
| `/registros_saude`   | `GET`, `POST` (multipart), `PUT /:id`, `DELETE /:id`                                |
| `/financeiro`        | `GET` (filtros: `petId`, `categoria`, `from`, `to`), `POST`, `PUT /:id`, `DELETE /:id` |
| `/suprimentos`       | `GET`, `POST`, `PUT /:id`, `DELETE /:id`                                            |
| `/avaliacoes`        | `GET` (filtros: `profissional`, `servico`, `nota`), `POST`, `PUT /:id`, `DELETE /:id` |
| `/pet-access`        | `GET /shared-with-me` (vet), `GET /pet/:petId`, `POST /pet/:petId`, `DELETE /pet/:petId/vet/:vetUserId` |
| `/relatorios`        | `GET /saude?petId&from&to[&format=pdf]`, `GET /gastos?from&to[&petId][&format=pdf]` |
| `/notificacoes`      | `GET`                                                                               |
| `/health`            | `GET`                                                                               |

## Banco de Dados

SQLite em `backend/data/app.db` (auto-criado). Schema em [backend/src/infrastructure/db.ts](backend/src/infrastructure/db.ts).

Tabelas: `users`, `pets`, `agenda`, `registros_saude`, `financeiro`, `suprimentos`, `avaliacoes`, `pet_access`, `password_reset_tokens`. Todas com `ON DELETE CASCADE` para manter integridade.

## Validações

- **Nome / Raça / Anotações**: 3–100 caracteres
- **Email**: 10–256 caracteres
- **CPF**: 11 dígitos, formato `000.000.000-00`
- **Celular**: `(00) 00000-0000`
- **Senha**: 8–12 chars, ≥1 maiúscula, ≥1 número, ≥1 caractere especial (RNF1.3)
- **Anexo de registro de saúde**: PDF/PNG/JPG, máx 5MB (RF4.3)
- **Foto de pet**: PNG/JPG/WEBP/GIF, máx 5MB (RNF2.2)
- **Avaliação**: nota 1-5 inteiro, comentário até 500 chars

Implementação em [backend/src/application/validators.ts](backend/src/application/validators.ts).

## Segurança & LGPD

- **Hash de senha:** Bcrypt (10 rounds) — RNF1.1
- **JWT** com expiração de 7 dias (segredo via `JWT_SECRET`)
- **Reset de senha:** token aleatório de 32 bytes, expira em 1h, marcado como usado após consumo
- **LGPD** (RNF6.1):
  - Checkbox obrigatório de aceite no cadastro
  - Página de [Termos de Uso e Política de Privacidade](frontend/src/app/components/TermosPage.tsx) acessível em `/termos`
  - **Direito de exclusão:** usuário pode deletar a própria conta em "Meu Perfil" (cascade remove todos os dados)
  - **Direito de portabilidade:** relatórios exportáveis em PDF
- **CRMV** validado para profissionais (RNF6.2)

## Notificações & Email (modo dev)

- **Notificações in-app:** funcionais (badge no sininho atualiza a cada 60s, página `/notificacoes` lista compromissos próximos + suprimentos a repor).
- **Email de recuperação de senha:** token é gerado e impresso no **console do backend**. Para produção, substitua o `console.log` em [routes/auth.ts](backend/src/presentation/routes/auth.ts) (`/forgot-password`) por integração com SMTP/SendGrid/Resend.

## Testes E2E (Selenium)

Em [testes/](testes/). Para rodar com janela visível e delay entre ações:

```powershell
cd testes
$env:MEUPET_HEADLESS='0'; $env:MEUPET_E2E_DELAY='1'
.\run.ps1                                  # todos
python .\test_pets_flow.py                 # individual
```

> ⚠️ Os testes E2E foram escritos antes das novas features (Financeiro, Estoque, Avaliações). Cobertura atual: registro/login, pets, agenda, registros de saúde, admin de usuários.

## Documentação Adicional

- [Planejamento SCRUM (Grupo 8)](documentation/)
- [Guia de Arquitetura](documentation/GUIA_ARQUITETURAL.md)
- [Guia de Implementação](documentation/GUIA_IMPLEMENTACAO.md)

## Licença

MIT.
