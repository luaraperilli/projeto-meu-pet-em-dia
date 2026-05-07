import { PetSpecies } from './Pet';

export type TipoRegistro = 'Vacina' | 'Cirurgia' | 'Exame' | 'Observação';

export interface RegistroSaude {
  id: number;
  petId: number;
  userId: number;
  tipoRegistro: TipoRegistro;
  data: string;
  horario: string;
  profissional: string;
  createdAt: string;
}

export type RegistroSaudeInputDTO = Omit<RegistroSaude, 'id' | 'createdAt' | 'userId'>;

export type RegistroSaudeFormFields = RegistroSaudeInputDTO & {
  petId: string;
};

export type RegistroSaudeItem = RegistroSaude & {
  petName: string;
  petSpecies: PetSpecies;
};
