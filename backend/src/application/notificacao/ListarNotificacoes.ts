import { db } from '../../infrastructure/db';

export type Notificacao = {
  id: string;
  tipo: 'agenda' | 'suprimento';
  titulo: string;
  descricao: string;
  data: string;
  diasRestantes: number;
};

const DEFAULT_AGENDA_DIAS = 7;

export class ListarNotificacoes {
  execute(userId: number): Notificacao[] {
    const notificacoes: Notificacao[] = [];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const limiteAgenda = new Date(hoje);
    limiteAgenda.setDate(limiteAgenda.getDate() + DEFAULT_AGENDA_DIAS);

    const agendamentos = db
      .prepare(
        `SELECT a.*, p.name AS petName
         FROM agenda a
         JOIN pets p ON a.petId = p.id
         WHERE p.ownerId = ? AND a.data >= ? AND a.data <= ?
         ORDER BY a.data, a.horario`,
      )
      .all(userId, hoje.toISOString().slice(0, 10), limiteAgenda.toISOString().slice(0, 10)) as Array<{
      id: number;
      petName: string;
      procedimento: string;
      data: string;
      horario: string;
    }>;

    for (const a of agendamentos) {
      const dias = Math.ceil((new Date(a.data).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      notificacoes.push({
        id: `agenda-${a.id}`,
        tipo: 'agenda',
        titulo: `${a.procedimento} de ${a.petName}`,
        descricao: `Agendado para ${a.data} às ${a.horario}`,
        data: a.data,
        diasRestantes: Math.max(0, dias),
      });
    }

    const suprimentos = db
      .prepare(
        `SELECT * FROM suprimentos
         WHERE userId = ? AND consumoDiario IS NOT NULL AND consumoDiario > 0`,
      )
      .all(userId) as Array<{
      id: number;
      nome: string;
      quantidade: number;
      unidade: string;
      consumoDiario: number;
      diasAlerta: number;
    }>;

    for (const s of suprimentos) {
      const diasRestantes = Math.floor(s.quantidade / s.consumoDiario);
      if (diasRestantes <= s.diasAlerta) {
        notificacoes.push({
          id: `suprimento-${s.id}`,
          tipo: 'suprimento',
          titulo: `Repor ${s.nome}`,
          descricao: `Restam ${s.quantidade} ${s.unidade} (~${diasRestantes} dias com consumo atual)`,
          data: hoje.toISOString().slice(0, 10),
          diasRestantes,
        });
      }
    }

    return notificacoes.sort((a, b) => a.diasRestantes - b.diasRestantes);
  }
}
