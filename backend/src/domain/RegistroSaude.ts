export type TipoRegistro = 'Vacina' | 'Cirurgia' | 'Exame' | 'Observação';

export interface RegistroSaude {
  id: number;
  petId: number;
  tipoRegistro: TipoRegistro;
  data: string;
  horario: string;
  profissional: string | null;
  filePath: string | null;
  createdAt: string;
  userId: number;
}

export interface RegistroSaudeInputDTO extends Omit<RegistroSaude, 'id' | 'createdAt' | 'userId' | 'filePath'> {
  filePath: string | null;
}

export interface CreateRegistroSaudeInput extends RegistroSaudeInputDTO {
  file: Buffer | null;
}
