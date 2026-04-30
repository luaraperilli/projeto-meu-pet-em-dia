import { Agenda } from '../../domain/Agenda';
import { AgendaRepository } from '../../infrastructure/repositories/AgendaRepository';

export class ListAgendaByOwner {
  constructor(private readonly agendaRepo: AgendaRepository) {}

  execute(ownerId: number): Agenda[] {
    return this.agendaRepo.findAllByOwner(ownerId);
  }
}
