import { Avaliacao, AvaliacaoInputDTO } from '../../domain/Avaliacao';

export interface AvaliacaoRepository {
  create(data: AvaliacaoInputDTO & { userId: number }): Avaliacao;
  update(id: number, data: Partial<AvaliacaoInputDTO>): Avaliacao;
  delete(id: number): void;
  findById(id: number): Avaliacao | null;
  findAll(filter?: { profissional?: string; servico?: string; nota?: number }): Avaliacao[];
  findAllByUser(userId: number): Avaliacao[];
}
