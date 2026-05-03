export type Notificacao = {
  id: string;
  tipo: 'agenda' | 'suprimento';
  titulo: string;
  descricao: string;
  data: string;
  diasRestantes: number;
};
