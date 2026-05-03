export interface Avaliacao {
  id: number;
  userId: number;
  profissional: string;
  servico: string;
  nota: number;
  comentario: string | null;
  data: string;
  createdAt: string;
  autorNome?: string;
}
