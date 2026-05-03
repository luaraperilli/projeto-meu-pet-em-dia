import 'dotenv/config';
import { SqliteUserRepository } from '../infrastructure/repositories/SqliteUserRepository';
import { SqlitePetRepository } from '../infrastructure/repositories/SqlitePetRepository';
import { SqliteAgendaRepository } from '../infrastructure/repositories/SqliteAgendaRepository';
import { SqliteRegistroSaudeRepository } from '../infrastructure/repositories/SqliteRegistroSaudeRepository';
import { SqliteFinanceiroRepository } from '../infrastructure/repositories/SqliteFinanceiroRepository';
import { SqliteSuprimentoRepository } from '../infrastructure/repositories/SqliteSuprimentoRepository';
import { SqliteAvaliacaoRepository } from '../infrastructure/repositories/SqliteAvaliacaoRepository';
import { SqlitePetAccessRepository } from '../infrastructure/repositories/SqlitePetAccessRepository';
import { CreateUser, CreateUserInput } from '../application/CreateUser';
import { User } from '../domain/User';

const PASSWORD = 'Teste@123';

const SEED_USERS: CreateUserInput[] = [
  {
    name: 'Administrador de Teste',
    email: 'admin@test.com',
    cpf: '111.111.111-11',
    type: 'Tutor',
    phone: '(11) 99999-1111',
    address: 'Endereço de teste, 100 — São Paulo/SP',
    password: PASSWORD,
    role: 'admin',
  },
  {
    name: 'Tutor de Teste',
    email: 'tutor@test.com',
    cpf: '222.222.222-22',
    type: 'Tutor',
    phone: '(11) 99999-2222',
    address: 'Rua das Flores, 200 — Itajubá/MG',
    password: PASSWORD,
  },
  {
    name: 'Veterinário de Teste',
    email: 'vet@test.com',
    cpf: '333.333.333-33',
    type: 'Veterinário',
    phone: '(11) 99999-3333',
    password: PASSWORD,
    crmv: 'CRMV-SP 12345',
    clinicAddress: 'Clínica Pet Saudável, Av. Paulista 1000 — São Paulo/SP',
    professionalIdDocPath: '/uploads/seed-prof-doc.pdf',
    diplomaDocPath: '/uploads/seed-diploma.pdf',
  },
];

function isoDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function seedTutorData(tutor: User, vet: User) {
  const petRepo = new SqlitePetRepository();
  const agendaRepo = new SqliteAgendaRepository();
  const registroRepo = new SqliteRegistroSaudeRepository();
  const financeiroRepo = new SqliteFinanceiroRepository();
  const suprimentoRepo = new SqliteSuprimentoRepository();
  const avaliacaoRepo = new SqliteAvaliacaoRepository();
  const accessRepo = new SqlitePetAccessRepository();

  // Pets
  const mel = petRepo.create({
    ownerId: tutor.id!,
    name: 'Mel',
    species: 'Cachorro',
    breed: 'Golden Retriever',
    sex: 'Fêmea',
    age: 4,
    weight: 28.5,
    height: 56,
    notes: 'Alérgica a frango. Dócil com crianças.',
    photoPath: null,
  });
  const frederico = petRepo.create({
    ownerId: tutor.id!,
    name: 'Frederico',
    species: 'Gato',
    breed: 'Siamês',
    sex: 'Macho',
    age: 2,
    weight: 4.2,
    height: 25,
    notes: 'Castrado. Vacinação em dia.',
    photoPath: null,
  });
  console.log(`  pets: ${mel.name}, ${frederico.name}`);

  // Agenda (próximos compromissos pra acionar notificação)
  agendaRepo.create({
    petId: mel.id!,
    procedimento: 'Vacina',
    data: isoDateOffset(2),
    horario: '14:00',
    profissional: 'Dr. José da Silva',
    observacoes: 'Reforço da V10 anual',
  });
  agendaRepo.create({
    petId: mel.id!,
    procedimento: 'Banho/Tosa',
    data: isoDateOffset(5),
    horario: '10:30',
    profissional: 'Pet Shop Felicidade',
    observacoes: null,
  });
  agendaRepo.create({
    petId: frederico.id!,
    procedimento: 'Consulta',
    data: isoDateOffset(7),
    horario: '16:00',
    profissional: 'Dra. Mariana Oliveira',
    observacoes: 'Avaliação geral',
  });
  console.log('  agenda: 3 compromissos');

  // Registros de saúde
  registroRepo.create({
    petId: mel.id!,
    userId: tutor.id!,
    tipoRegistro: 'Vacina',
    data: isoDateOffset(-180),
    horario: '09:00',
    profissional: 'Dr. José da Silva',
    filePath: null,
  });
  registroRepo.create({
    petId: mel.id!,
    userId: tutor.id!,
    tipoRegistro: 'Cirurgia',
    data: isoDateOffset(-90),
    horario: '08:00',
    profissional: 'Dra. Patrícia Souza',
    filePath: null,
  });
  registroRepo.create({
    petId: frederico.id!,
    userId: tutor.id!,
    tipoRegistro: 'Exame',
    data: isoDateOffset(-30),
    horario: '11:00',
    profissional: 'Dra. Mariana Oliveira',
    filePath: null,
  });
  registroRepo.create({
    petId: frederico.id!,
    userId: tutor.id!,
    tipoRegistro: 'Observação',
    data: isoDateOffset(-15),
    horario: '20:00',
    profissional: 'Tutor de Teste',
    filePath: null,
  });
  console.log('  registros de saúde: 4');

  // Financeiro (gastos com acentos)
  financeiroRepo.create({
    userId: tutor.id!,
    petId: mel.id!,
    categoria: 'Vacina',
    data: isoDateOffset(-180),
    valor: 150.0,
    observacoes: 'Reforço antirrábica anual',
  });
  financeiroRepo.create({
    userId: tutor.id!,
    petId: mel.id!,
    categoria: 'Consulta',
    data: isoDateOffset(-90),
    valor: 250.0,
    observacoes: 'Pré-operatório de castração',
  });
  financeiroRepo.create({
    userId: tutor.id!,
    petId: frederico.id!,
    categoria: 'Exame',
    data: isoDateOffset(-30),
    valor: 320.5,
    observacoes: 'Hemograma completo e função renal',
  });
  financeiroRepo.create({
    userId: tutor.id!,
    petId: mel.id!,
    categoria: 'Suprimento',
    data: isoDateOffset(-7),
    valor: 189.9,
    observacoes: 'Ração premium 15kg',
  });
  console.log('  financeiro: 4 lançamentos');

  // Suprimentos (com alerta de reposição)
  suprimentoRepo.create({
    userId: tutor.id!,
    petId: mel.id!,
    nome: 'Ração Premium 15kg',
    categoria: 'Ração',
    quantidade: 3,
    unidade: 'kg',
    consumoDiario: 0.4,
    diasAlerta: 10,
  });
  suprimentoRepo.create({
    userId: tutor.id!,
    petId: frederico.id!,
    nome: 'Antipulgas Bravecto',
    categoria: 'Medicamento',
    quantidade: 2,
    unidade: 'comprimidos',
    consumoDiario: null,
    diasAlerta: 30,
  });
  suprimentoRepo.create({
    userId: tutor.id!,
    petId: null,
    nome: 'Areia sanitária',
    categoria: 'Higiene',
    quantidade: 4,
    unidade: 'kg',
    consumoDiario: 0.5,
    diasAlerta: 7,
  });
  console.log('  suprimentos: 3');

  // Avaliações (notas + comentários com acentos)
  avaliacaoRepo.create({
    userId: tutor.id!,
    profissional: 'Dr. José da Silva',
    servico: 'Consulta veterinária',
    nota: 5,
    comentario: 'Atencioso, explicou o tratamento com clareza e foi muito carinhoso com a Mel.',
  });
  avaliacaoRepo.create({
    userId: tutor.id!,
    profissional: 'Dra. Mariana Oliveira',
    servico: 'Exame de sangue',
    nota: 4,
    comentario: 'Resultado rápido, mas precisei ligar pra clínica pra receber o laudo.',
  });
  avaliacaoRepo.create({
    userId: tutor.id!,
    profissional: 'Pet Shop Felicidade',
    servico: 'Banho e tosa',
    nota: 5,
    comentario: 'Mel ficou linda e cheirosa! Recomendo demais.',
  });
  console.log('  avaliações: 3');

  // Compartilhamento com vet (RF4.2): vet tem acesso à Mel
  accessRepo.grant(mel.id!, vet.id!);
  console.log(`  pet-access: ${vet.email} → ${mel.name}`);
}

async function main() {
  const repo = new SqliteUserRepository();
  const usecase = new CreateUser(repo);

  const created: Record<string, User> = {};
  for (const input of SEED_USERS) {
    const existing = repo.findByEmail(input.email);
    if (existing) {
      console.log(`[SEED] já existe: ${input.email}`);
      created[input.email] = existing;
      continue;
    }
    const user = usecase.execute(input);
    console.log(`[SEED] criado: ${user.email} (${user.type}, role=${user.role})`);
    created[input.email] = user;
  }

  const tutor = created['tutor@test.com'];
  const vet = created['vet@test.com'];

  // Só popula dados extras se o tutor foi criado agora (evita duplicação)
  const tutorPets = new SqlitePetRepository().findAllByOwner(tutor.id!, {});
  if (tutorPets.length === 0) {
    console.log('[SEED] populando dados de exemplo para o tutor...');
    seedTutorData(tutor, vet);
  } else {
    console.log('[SEED] tutor já tem dados, pulando dados de exemplo');
  }
}

main().catch((e) => {
  console.error('[SEED] Falha:', e);
  process.exit(1);
});
