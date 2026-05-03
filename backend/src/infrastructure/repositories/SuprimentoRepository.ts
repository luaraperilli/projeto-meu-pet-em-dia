import { Suprimento, SuprimentoInputDTO } from '../../domain/Suprimento';

export interface SuprimentoRepository {
  create(data: SuprimentoInputDTO & { userId: number }): Suprimento;
  update(id: number, data: Partial<SuprimentoInputDTO>): Suprimento;
  delete(id: number): void;
  findById(id: number): Suprimento | null;
  findAllByOwner(ownerId: number): Suprimento[];
}
