export type TipoRegistro = 'Vacina' | 'Cirurgia' | 'Exame' | 'Observação';

export interface RegistroSaude {
  id: number;
  petId: number;
  tipoRegistro: TipoRegistro;
  data: string;
  horario: string;
  profissional: string | null;
  createdAt: string;
  userId: number;
}

export type RegistroSaudeInputDTO = Omit<RegistroSaude, 'id' | 'createdAt' | 'userId'>;
