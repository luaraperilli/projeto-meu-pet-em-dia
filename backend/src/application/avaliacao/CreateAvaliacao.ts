import { Avaliacao, AvaliacaoInputDTO } from '../../domain/Avaliacao';
import { AvaliacaoRepository } from '../../infrastructure/repositories/AvaliacaoRepository';

export type CreateAvaliacaoInput = {
  userId: number;
  data: AvaliacaoInputDTO;
};

export class CreateAvaliacao {
  constructor(private readonly repo: AvaliacaoRepository) {}

  execute(input: CreateAvaliacaoInput): Avaliacao {
    const { data, userId } = input;
    const errors: Record<string, string> = {};

    if (!data.profissional || data.profissional.trim().length < 3 || data.profissional.length > 100) {
      errors.profissional = 'Profissional deve ter entre 3 e 100 caracteres';
    }
    if (!data.servico || data.servico.trim().length < 3 || data.servico.length > 100) {
      errors.servico = 'Serviço deve ter entre 3 e 100 caracteres';
    }
    if (!Number.isInteger(data.nota) || data.nota < 1 || data.nota > 5) {
      errors.nota = 'Nota deve ser um inteiro entre 1 e 5';
    }
    if (data.comentario && data.comentario.length > 500) {
      errors.comentario = 'Comentário deve ter no máximo 500 caracteres';
    }

    if (Object.keys(errors).length) {
      const err = new Error('ValidationError') as Error & { errors?: Record<string, string> };
      err.errors = errors;
      throw err;
    }

    return this.repo.create({
      userId,
      profissional: data.profissional.trim(),
      servico: data.servico.trim(),
      nota: data.nota,
      comentario: data.comentario?.trim() || null,
    });
  }
}
