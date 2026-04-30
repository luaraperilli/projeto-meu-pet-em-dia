export type UserType = 'Tutor' | 'Veterinário';
export type UserRole = 'admin' | 'user';

export interface User {
  id: number;
  name: string;
  cpf: string;
  type: UserType;
  email: string;
  phone: string;
  address?: string | null;
  role: UserRole;
  crmv?: string | null;
  clinicAddress?: string | null;
  professionalIdDocPath?: string | null;
  diplomaDocPath?: string | null;
  createdAt?: string;
}
