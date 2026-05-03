export type CategoriaFinanceiro = 'Consulta' | 'Vacina' | 'Medicamento' | 'Exame' | 'Suprimento' | 'Outros';

export const CATEGORIAS_FINANCEIRO: readonly CategoriaFinanceiro[] = [
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
}

export type FinanceiroInputDTO = Omit<Financeiro, 'id' | 'userId' | 'createdAt'>;
