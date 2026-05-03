export type CategoriaSuprimento = 'Ração' | 'Medicamento' | 'Higiene' | 'Acessório' | 'Outros';

export const CATEGORIAS_SUPRIMENTO: readonly CategoriaSuprimento[] = [
  'Ração',
  'Medicamento',
  'Higiene',
  'Acessório',
  'Outros',
];

export interface Suprimento {
  id: number;
  userId: number;
  petId: number | null;
  nome: string;
  categoria: CategoriaSuprimento;
  quantidade: number;
  unidade: string;
  consumoDiario: number | null;
  diasAlerta: number;
  createdAt: string;
  updatedAt: string;
}

export type SuprimentoInputDTO = Omit<Suprimento, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
