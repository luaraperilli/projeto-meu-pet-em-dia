import { PetSpecies } from './Pet';

export type CategoriaFinanceiro = 'Consulta' | 'Vacina' | 'Medicamento' | 'Exame' | 'Suprimento' | 'Outros';

export const CATEGORIAS_FINANCEIRO: CategoriaFinanceiro[] = [
  'Consulta',
  'Vacina',
  'Medicamento',
  'Exame',
  'Suprimento',
  'Outros',
];

export interface Financeiro {
  id: number;
  petId: number;
  userId: number;
  categoria: CategoriaFinanceiro;
  data: string;
  valor: number;
  observacoes: string | null;
  createdAt: string;
  petName?: string;
  petSpecies?: PetSpecies;
}
