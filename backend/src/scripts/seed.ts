import 'dotenv/config';
import { SqliteUserRepository } from '../infrastructure/repositories/SqliteUserRepository';
import { SqlitePetRepository } from '../infrastructure/repositories/SqlitePetRepository';
import { SqliteAgendaRepository } from '../infrastructure/repositories/SqliteAgendaRepository';
import { SqliteRegistroSaudeRepository } from '../infrastructure/repositories/SqliteRegistroSaudeRepository';
import { CreateUser, CreateUserInput } from '../application/CreateUser';
import { User } from '../domain/User';

const PASSWORD = 'Teste@123';

const SEED_USERS: CreateUserInput[] = [
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

function seedTutorData(tutor: User) {
  const petRepo = new SqlitePetRepository();
  const agendaRepo = new SqliteAgendaRepository();
  const registroRepo = new SqliteRegistroSaudeRepository();

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

  registroRepo.create({
    petId: mel.id!,
    userId: tutor.id!,
    tipoRegistro: 'Vacina',
    data: isoDateOffset(-180),
    horario: '09:00',
    profissional: 'Dr. José da Silva',
  });
  registroRepo.create({
    petId: mel.id!,
    userId: tutor.id!,
    tipoRegistro: 'Cirurgia',
    data: isoDateOffset(-90),
    horario: '08:00',
    profissional: 'Dra. Patrícia Souza',
  });
  registroRepo.create({
    petId: frederico.id!,
    userId: tutor.id!,
    tipoRegistro: 'Exame',
    data: isoDateOffset(-30),
    horario: '11:00',
    profissional: 'Dra. Mariana Oliveira',
  });
  registroRepo.create({
    petId: frederico.id!,
    userId: tutor.id!,
    tipoRegistro: 'Observação',
    data: isoDateOffset(-15),
    horario: '20:00',
    profissional: 'Tutor de Teste',
  });
  console.log('  registros de saúde: 4');
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

  const tutorPets = new SqlitePetRepository().findAllByOwner(tutor.id!, {});
  if (tutorPets.length === 0) {
    console.log('[SEED] populando dados de exemplo para o tutor...');
    seedTutorData(tutor);
  } else {
    console.log('[SEED] tutor já tem dados, pulando dados de exemplo');
  }
}

main().catch((e) => {
  console.error('[SEED] Falha:', e);
  process.exit(1);
});
