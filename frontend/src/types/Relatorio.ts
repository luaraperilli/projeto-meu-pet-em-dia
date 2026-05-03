import { Pet } from './Pet';
import { Agenda } from './Agenda';
import { RegistroSaude } from './RegistroSaude';
import { Financeiro } from './Financeiro';

export type RelatorioSaude = {
  pet: Pet;
  periodo: { from: string; to: string };
  registros: RegistroSaude[];
  agenda: Agenda[];
};

export type RelatorioGastos = {
  periodo: { from: string; to: string };
  total: number;
  porCategoria: Record<string, number>;
  porPet: Array<{ petName: string; total: number }>;
  registros: Financeiro[];
};
