import { Link } from 'react-router-dom';

export function TermosPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '32px 16px' }}>
      <div
        style={{
          maxWidth: 800,
          margin: '0 auto',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-xl)',
          padding: 32,
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border)',
        }}
      >
        <Link to="/register" style={{ fontSize: 'var(--text-sm)', color: 'var(--primary)' }}>
          ← Voltar
        </Link>
        <h1 style={{ fontFamily: 'var(--font-primary)', marginTop: 16 }}>Termos de Uso e Política de Privacidade</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Última atualização: abril/2026</p>

        <h2>1. Sobre o serviço</h2>
        <p>
          O Meu Pet em Dia é uma plataforma para gestão da saúde de animais de estimação, conectando tutores e
          veterinários. Ao criar uma conta, você concorda com estes termos.
        </p>

        <h2>2. Dados pessoais coletados (LGPD - Lei nº 13.709/2018)</h2>
        <p>Coletamos os seguintes dados, todos fornecidos voluntariamente por você:</p>
        <ul>
          <li>Nome completo, CPF, e-mail, telefone e endereço</li>
          <li>Para veterinários: CRMV e documentos comprobatórios</li>
          <li>Dados sobre seus pets (nome, espécie, raça, fotos, histórico clínico)</li>
          <li>Registros de agenda, gastos, suprimentos e avaliações</li>
        </ul>

        <h2>3. Finalidade do uso</h2>
        <p>
          Os dados são usados exclusivamente para operar a plataforma — autenticação, organização do histórico,
          notificações de cuidados e geração de relatórios. <strong>Não vendemos seus dados a terceiros.</strong>
        </p>

        <h2>4. Compartilhamento controlado</h2>
        <p>
          Você pode conceder acesso de leitura/escrita do histórico de seus pets a veterinários cadastrados, via
          fluxo explícito de autorização (RF4.2). Esse acesso pode ser revogado a qualquer momento.
        </p>

        <h2>5. Segurança</h2>
        <p>
          Senhas são armazenadas com hash <strong>Bcrypt</strong> (RNF1.1). Sessões são protegidas por tokens JWT
          com expiração de 7 dias. Comunicação entre cliente e servidor pode usar HTTPS em produção.
        </p>

        <h2>6. Seus direitos (LGPD)</h2>
        <ul>
          <li>
            <strong>Acesso:</strong> visualize seus dados em "Meu Perfil".
          </li>
          <li>
            <strong>Correção:</strong> edite a qualquer momento em "Meu Perfil".
          </li>
          <li>
            <strong>Exclusão:</strong> remova sua conta e todos os dados associados em "Meu Perfil → Excluir minha
            conta".
          </li>
          <li>
            <strong>Portabilidade:</strong> exporte seus relatórios em PDF.
          </li>
        </ul>

        <h2>7. Conformidade profissional</h2>
        <p>
          O cadastro de veterinários é validado contra o CRMV (RNF6.2), conforme requisitos do Conselho Federal de
          Medicina Veterinária.
        </p>

        <h2>8. Contato</h2>
        <p>Em caso de dúvidas sobre estes termos ou sobre seus dados, entre em contato com a equipe do projeto.</p>
      </div>
    </div>
  );
}
