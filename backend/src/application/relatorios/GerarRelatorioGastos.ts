import { Financeiro } from '../../domain/Financeiro';
import { FinanceiroRepository } from '../../infrastructure/repositories/FinanceiroRepository';

export type GerarRelatorioGastosInput = {
  userId: number;
  from: string;
  to: string;
  petId?: number;
};

export type RelatorioGastos = {
  periodo: { from: string; to: string };
  total: number;
  porCategoria: Record<string, number>;
  porPet: Array<{ petName: string; total: number }>;
  registros: Financeiro[];
};

type FinanceiroComPet = Financeiro & { petName?: string };

export class GerarRelatorioGastos {
  constructor(private readonly financeiroRepo: FinanceiroRepository) {}

  execute(input: GerarRelatorioGastosInput): RelatorioGastos {
    const registros = this.financeiroRepo.findAllByOwner(input.userId, {
      petId: input.petId,
      from: input.from,
      to: input.to,
    }) as FinanceiroComPet[];

    const total = registros.reduce((acc, r) => acc + r.valor, 0);

    const porCategoria: Record<string, number> = {};
    for (const r of registros) {
      porCategoria[r.categoria] = (porCategoria[r.categoria] ?? 0) + r.valor;
    }

    const porPetMap: Record<string, number> = {};
    for (const r of registros) {
      const nome = r.petName ?? `Pet #${r.petId}`;
      porPetMap[nome] = (porPetMap[nome] ?? 0) + r.valor;
    }
    const porPet = Object.entries(porPetMap).map(([petName, total]) => ({ petName, total }));

    return {
      periodo: { from: input.from, to: input.to },
      total,
      porCategoria,
      porPet,
      registros,
    };
  }
}
