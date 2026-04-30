import { User, UserRole, UserType } from '../domain/User';
import { UserRepository } from '../infrastructure/repositories/UserRepository';
import { isValidCPF, isValidEmail, isValidName, isValidPassword, isValidPhoneBr } from './validators';
import { hashPassword } from './password';

export type CreateUserInput = {
  name: string;
  cpf: string;
  type: UserType;
  email: string;
  phone: string;
  address?: string | null;
  password: string;
  crmv?: string | null;
  clinicAddress?: string | null;
  professionalIdDocPath?: string | null;
  diplomaDocPath?: string | null;
  role?: UserRole;
};

export class CreateUser {
  constructor(private readonly repo: UserRepository) {}

  execute(input: CreateUserInput): User {
    const errors: Record<string, string> = {};
    const normalizedCPF = normalizeCPF(input.cpf);

    if (!isValidName(input.name)) errors.name = 'Nome deve ter entre 3 e 100 caracteres';
    if (!isValidCPF(normalizedCPF)) errors.cpf = 'CPF inválido (use 000.000.000-00)';
    if (!['Tutor', 'Veterinário'].includes(input.type)) errors.type = 'Tipo inválido';
    if (!isValidEmail(input.email)) errors.email = 'E-mail inválido (10 a 256 caracteres)';
    if (!isValidPhoneBr(input.phone)) errors.phone = 'Celular inválido (formato: (00) 00000-0000)';
    if (!isValidPassword(input.password)) errors.password = 'Senha inválida (8-12, com número, especial e maiúscula)';

    if (input.type === 'Veterinário') {
      if (!input.crmv?.trim()) errors.crmv = 'CRMV é obrigatório';
      if (!input.professionalIdDocPath) errors.professionalIdDoc = 'Documento profissional é obrigatório';
      if (!input.diplomaDocPath) errors.diplomaDoc = 'Diploma/Certificado é obrigatório';
    }

    if (Object.keys(errors).length > 0) {
      const err = new Error('ValidationError') as Error & { errors?: Record<string, string> };
      err.errors = errors;
      throw err;
    }

    const existing = this.repo.findByCPF(normalizedCPF);
    if (existing) {
      const err = new Error('ValidationError') as Error & { errors?: Record<string, string> };
      err.errors = { cpf: 'CPF já cadastrado' };
      throw err;
    }

    const passwordHash = hashPassword(input.password);
    const user = this.repo.create({
      name: input.name.trim(),
      cpf: normalizedCPF,
      type: input.type,
      email: input.email.trim(),
      phone: input.phone.trim(),
      address: input.type === 'Tutor' ? input.address?.trim() || null : null,
      passwordHash,
      role: input.role ?? 'user',
      crmv: input.type === 'Veterinário' ? input.crmv?.trim() || null : null,
      clinicAddress: input.type === 'Veterinário' ? input.clinicAddress?.trim() || null : null,
      professionalIdDocPath: input.type === 'Veterinário' ? (input.professionalIdDocPath ?? null) : null,
      diplomaDocPath: input.type === 'Veterinário' ? (input.diplomaDocPath ?? null) : null,
    });
    return user;
  }
}

function normalizeCPF(cpf: string): string {
  const d = cpf.replace(/\D/g, '');
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
}
