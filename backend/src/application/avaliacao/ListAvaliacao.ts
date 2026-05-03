import { Avaliacao } from '../../domain/Avaliacao';
import { AvaliacaoRepository } from '../../infrastructure/repositories/AvaliacaoRepository';

export type ListAvaliacaoInput = {
  filter?: { profissional?: string; servico?: string; nota?: number };
};

export class ListAvaliacao {
  constructor(private readonly repo: AvaliacaoRepository) {}

  execute(input: ListAvaliacaoInput): Avaliacao[] {
    return this.repo.findAll(input.filter);
  }
}
