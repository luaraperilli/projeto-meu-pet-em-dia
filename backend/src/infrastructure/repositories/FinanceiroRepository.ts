import { Financeiro, FinanceiroInputDTO } from '../../domain/Financeiro';

export interface FinanceiroRepository {
  create(data: FinanceiroInputDTO & { userId: number }): Financeiro;
  update(id: number, data: Partial<FinanceiroInputDTO>): Financeiro;
  delete(id: number): void;
  findById(id: number): Financeiro | null;
  findAllByOwner(ownerId: number, filter?: { petId?: number; categoria?: string; from?: string; to?: string }): Financeiro[];
}
