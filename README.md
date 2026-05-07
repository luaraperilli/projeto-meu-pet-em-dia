# 🐾 Meu Pet em Dia — Entrega 1 (Sprints 1-3)

Sistema fullstack de gestão de saúde para pets — **branch da Entrega 1** do Planejamento SCRUM do Grupo 8 (Desenvolvimento de Sistemas Web — UNIFEI 2026.1).

> 📝 **Branch `sprints1-3`** — contém apenas as features das primeiras 3 sprints. Para o estado completo (Sprints 1-6), veja a `main`.

## Funcionalidades nesta branch

**Sprint 1 — Fundação & Autenticação** (RF1.1-1.4, RNF1.1, RNF1.3, RNF4.1, RNF5.2-5.3)

- Cadastro de tutores e veterinários (com CRMV + documentos)
- Login JWT com bcrypt para hash de senha
- Logout
- Estrutura DDD em 4 camadas
- Docker Compose

**Sprint 2 — Perfil & Pets** (RF1.5-1.6, RF2.1-2.4, RNF1.2, RNF3.2)

- Edição do próprio perfil + exclusão de conta (LGPD)
- Recuperação de senha por email (token de 1h, mockado em dev)
- CRUD completo de pets com foto
- UI responsiva
- Termos de Uso / Política de Privacidade no cadastro

**Sprint 3 — Agenda & Histórico** (RF3.1-3.3, RF4.1, RF4.4, RNF2.1, RNF3.1)

- Agendamento de consultas, vacinas, banhos, vermífugos
- Edição/cancelamento de agendamentos
- Notificações in-app de compromissos próximos (sininho com badge)
- Registros de saúde (vacinas, cirurgias, exames, observações) com upload de PDF/PNG/JPG
- Consulta do histórico completo do pet

## Funcionalidades adiadas para Sprints 4-6 (branch `main`)

Compartilhamento vet-tutor (RF4.2), Financeiro (RF5), Estoque (RF6), Relatórios PDF (RF7), Avaliações (RF8), Painel administrativo (RF9), LGPD avançado, testes E2E completos, revisões finais.

## Stack

- **Frontend:** React 18 + TypeScript, Vite, React Router, React Hook Form
- **Backend:** Node.js + Express + TypeScript, SQLite, JWT, **bcrypt** (RNF1.1)
- **Arquitetura:** DDD em 4 camadas — `domain/`, `application/`, `infrastructure/`, `presentation/`

## 🚀 Como Rodar Localmente

> Para colegas do grupo: siga esses passos do zero. Vai precisar de **2 terminais** (um pro backend, um pro frontend) rodando ao mesmo tempo.

### Pré-requisitos

- **Node.js 18+** ([download](https://nodejs.org/))
- **Git**

### 1. Clone e mude para a branch

```powershell
git clone https://github.com/luaraperilli/projeto-meu-pet-em-dia.git
cd projeto-meu-pet-em-dia
git checkout sprints1-3
```

### 2. Terminal 1 — Backend

```powershell
cd backend
cp .env.example .env             # default funciona pra dev local
npm install                      # 2-3 min (compila better-sqlite3 nativo)
npm run seed                     # cria os 2 usuários de teste
npm run dev                      # API em http://localhost:3001
```

### 3. Terminal 2 — Frontend

```powershell
cd frontend
cp .env.example .env.local
npm install
npm run dev                      # UI em http://localhost:5173
```

Abra http://localhost:5173 no navegador.

### 👥 Usuários de teste

Senha de todos: **`Teste@123`**

| Email | Perfil | O que testar |
|---|---|---|
| `tutor@test.com` | Tutor | Cadastro/edição de pets, agenda, registros de saúde, notificações |
| `vet@test.com` | Veterinário | Login + dados de perfil (sem features de leitura/escrita por enquanto — vem na Sprint 4) |

> 💡 O seed já popula 2 pets, 3 agendamentos e 4 registros de saúde para o tutor.

### Problemas comuns

| Problema | Solução |
|---|---|
| Porta 3001 ou 5173 ocupada | `netstat -ano \| findstr :3001` → `taskkill /PID <pid> /F` |
| `better-sqlite3` falha no `npm install` (Windows) | Instale build tools: `npm install --global windows-build-tools` (admin) |
| Erro de senha ao logar | Confirma se rodou `npm run seed` |
| IDE com erros TS antigos | Reinicia o TS Server: `Ctrl+Shift+P` → "TypeScript: Restart TS Server" |

## 📡 Endpoints da API

Rotas autenticadas exigem `Authorization: Bearer <token>`.

| Recurso | Métodos |
|---|---|
| `/auth` | `POST /register`, `POST /login`, `GET/PUT/DELETE /me`, `POST /forgot-password`, `POST /reset-password` |
| `/pets` | `GET`, `POST` (multipart com foto), `PUT /:id`, `DELETE /:id` |
| `/agenda` | `GET`, `GET /pet/:petId`, `POST`, `PUT /:id`, `DELETE /:id` |
| `/registros_saude` | `GET`, `POST` (multipart com PDF/PNG/JPG), `PUT /:id`, `DELETE /:id` |
| `/notificacoes` | `GET` (compromissos próximos) |
| `/health` | `GET` |

## 🗄️ Banco de Dados

SQLite em `backend/data/app.db` (auto-criado). Schema completo em [backend/src/infrastructure/db.ts](backend/src/infrastructure/db.ts).

Tabelas: `users`, `pets`, `agenda`, `registros_saude`, `password_reset_tokens`. Todas com `ON DELETE CASCADE`.

## ✅ Validações

- **Nome / Raça / Anotações**: 3–100 caracteres
- **Email**: 10–256 caracteres
- **CPF**: 11 dígitos, formato `000.000.000-00`
- **Celular**: `(00) 00000-0000`
- **Senha**: 8–12 chars, ≥1 maiúscula, ≥1 número, ≥1 caractere especial (RNF1.3)
- **Anexo de registro de saúde**: PDF/PNG/JPG, máx 5MB (RF4.3 — *avançado vem na Sprint 4*)
- **Foto de pet**: PNG/JPG/WEBP/GIF, máx 5MB

## 🔐 Segurança

- **Hash de senha:** Bcrypt (10 rounds) — RNF1.1
- **JWT** com expiração de 7 dias
- **Reset de senha:** token aleatório de 32 bytes, expira em 1h. Em dev, o token aparece no **console do backend** (integração SMTP fica para etapa de produção)

## 📚 Documentação adicional

- [Planejamento SCRUM (Grupo 8)](documentation/)
- [Guia de Arquitetura](documentation/GUIA_ARQUITETURAL.md)
- [Guia de Implementação](documentation/GUIA_IMPLEMENTACAO.md)

## Licença

MIT.
