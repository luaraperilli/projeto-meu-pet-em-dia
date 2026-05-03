export type CategoriaSuprimento = 'Ração' | 'Medicamento' | 'Higiene' | 'Acessório' | 'Outros';

export const CATEGORIAS_SUPRIMENTO: CategoriaSuprimento[] = [
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
  petName?: string;
}
