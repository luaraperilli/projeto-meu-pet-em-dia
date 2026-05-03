import { Router } from 'express';
import PDFDocument from 'pdfkit';
import { requireAuth } from '../middleware/auth';
import { SqlitePetRepository } from '../../infrastructure/repositories/SqlitePetRepository';
import { SqliteFinanceiroRepository } from '../../infrastructure/repositories/SqliteFinanceiroRepository';
import { GerarRelatorioSaude, RelatorioSaude } from '../../application/relatorios/GerarRelatorioSaude';
import { GerarRelatorioGastos, RelatorioGastos } from '../../application/relatorios/GerarRelatorioGastos';

export const relatoriosRouter = Router();
relatoriosRouter.use(requireAuth);

function parsePeriodo(req: any) {
  const from = String(req.query.from || '');
  const to = String(req.query.to || '');
  if (!from || !to) throw new Error('Período (from, to) é obrigatório');
  return { from, to };
}

relatoriosRouter.get('/saude', (req: any, res) => {
  try {
    const { from, to } = parsePeriodo(req);
    const petId = Number(req.query.petId);
    if (!petId) throw new Error('petId é obrigatório');

    const usecase = new GerarRelatorioSaude(new SqlitePetRepository());
    const relatorio = usecase.execute({ userId: req.user.id, petId, from, to });

    if (req.query.format === 'pdf') {
      return enviarPdfSaude(res, relatorio);
    }
    res.json(relatorio);
  } catch (e: any) {
    res.status(400).json({ message: e.message || 'Erro ao gerar relatório de saúde' });
  }
});

relatoriosRouter.get('/gastos', (req: any, res) => {
  try {
    const { from, to } = parsePeriodo(req);
    const petId = req.query.petId ? Number(req.query.petId) : undefined;

    const usecase = new GerarRelatorioGastos(new SqliteFinanceiroRepository());
    const relatorio = usecase.execute({ userId: req.user.id, from, to, petId });

    if (req.query.format === 'pdf') {
      return enviarPdfGastos(res, relatorio);
    }
    res.json(relatorio);
  } catch (e: any) {
    res.status(400).json({ message: e.message || 'Erro ao gerar relatório de gastos' });
  }
});

function enviarPdfSaude(res: any, r: RelatorioSaude) {
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="relatorio_saude_${r.pet.name}.pdf"`);
  doc.pipe(res);

  doc.fontSize(20).text(`Relatório de Saúde — ${r.pet.name}`, { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor('#666').text(`Espécie: ${r.pet.species} | Período: ${r.periodo.from} a ${r.periodo.to}`, { align: 'center' });
  doc.moveDown(1);
  doc.fillColor('black');

  doc.fontSize(14).text('Registros de Saúde', { underline: true });
  doc.moveDown(0.3);
  if (!r.registros.length) {
    doc.fontSize(10).fillColor('#666').text('Nenhum registro no período.');
  } else {
    for (const reg of r.registros) {
      doc.fontSize(10).fillColor('black').text(
        `${reg.data} ${reg.horario} — ${reg.tipoRegistro} (${reg.profissional})`,
      );
    }
  }
  doc.moveDown(1);

  doc.fontSize(14).fillColor('black').text('Agendamentos', { underline: true });
  doc.moveDown(0.3);
  if (!r.agenda.length) {
    doc.fontSize(10).fillColor('#666').text('Nenhum agendamento no período.');
  } else {
    for (const a of r.agenda) {
      doc.fontSize(10).fillColor('black').text(
        `${a.data} ${a.horario} — ${a.procedimento}${a.profissional ? ' (' + a.profissional + ')' : ''}`,
      );
    }
  }

  doc.end();
}

function enviarPdfGastos(res: any, r: RelatorioGastos) {
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="relatorio_gastos.pdf"`);
  doc.pipe(res);

  doc.fontSize(20).text('Relatório de Gastos', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor('#666').text(`Período: ${r.periodo.from} a ${r.periodo.to}`, { align: 'center' });
  doc.moveDown(1);
  doc.fillColor('black');

  doc.fontSize(16).text(`Total: R$ ${r.total.toFixed(2)}`);
  doc.moveDown(1);

  doc.fontSize(14).text('Por Categoria', { underline: true });
  doc.moveDown(0.3);
  for (const [cat, valor] of Object.entries(r.porCategoria)) {
    doc.fontSize(10).text(`${cat}: R$ ${valor.toFixed(2)}`);
  }
  doc.moveDown(1);

  doc.fontSize(14).text('Por Pet', { underline: true });
  doc.moveDown(0.3);
  for (const p of r.porPet) {
    doc.fontSize(10).text(`${p.petName}: R$ ${p.total.toFixed(2)}`);
  }
  doc.moveDown(1);

  doc.fontSize(14).text('Detalhes', { underline: true });
  doc.moveDown(0.3);
  for (const reg of r.registros) {
    doc.fontSize(10).text(
      `${reg.data} — ${reg.categoria} — R$ ${reg.valor.toFixed(2)}${reg.observacoes ? ' — ' + reg.observacoes : ''}`,
    );
  }

  doc.end();
}
