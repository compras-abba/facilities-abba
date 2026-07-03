const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const RED = '\x1b[31m';

function logEmail({ para, assunto, corpo }) {
  console.log(`\n${CYAN}📧 ========== EMAIL SIMULADO ==========${RESET}`);
  console.log(`${YELLOW}Para:${RESET}    ${para}`);
  console.log(`${YELLOW}Assunto:${RESET} ${assunto}`);
  console.log(`${YELLOW}Corpo:${RESET}`);
  console.log(corpo);
  console.log(`${CYAN}======================================${RESET}\n`);
}

function notificarNovaFacilities(sol) {
  logEmail({
    para: 'facilities@empresa.com',
    assunto: `[Facilities] Nova solicitação: ${sol.tipo} - ${sol.local_area}`,
    corpo: `${GREEN}Nova solicitação de Facilities recebida!${RESET}

Solicitante: ${sol.solicitante_nome}
Setor: ${sol.setor}
Tipo: ${sol.tipo}
Local: ${sol.local_area}${sol.local_detalhe ? ' - ' + sol.local_detalhe : ''}
Prioridade: ${sol.prioridade}
Descrição: ${sol.descricao}

ID: ${sol.id}
Criado em: ${new Date(sol.created_at).toLocaleString('pt-BR')}`,
  });
}

function notificarResponsavel(sol) {
  const para = sol.responsavel_email || 'facilities@empresa.com';
  logEmail({
    para,
    assunto: `[Facilities] Solicitação atribuída: ${sol.tipo} - ${sol.local_area}`,
    corpo: `${MAGENTA}Você foi atribuído a uma solicitação de Facilities.${RESET}

Solicitante: ${sol.solicitante_nome}
Tipo: ${sol.tipo}
Local: ${sol.local_area}
Prioridade: ${sol.prioridade}
Descrição: ${sol.descricao}

${sol.diagnostico ? 'Diagnóstico: ' + sol.diagnostico : ''}

Fase atual: Diagnóstico
ID: ${sol.id}`,
  });
}

function notificarExecucao(sol) {
  const para = sol.responsavel_email || 'facilities@empresa.com';
  logEmail({
    para,
    assunto: `[Facilities] Iniciar execução: ${sol.tipo} - ${sol.local_area}`,
    corpo: `${GREEN}A solicitação foi aprovada para execução.${RESET}

Tipo: ${sol.tipo}
Local: ${sol.local_area}
Responsável: ${sol.responsavel_nome || 'Não definido'}
${sol.data_agendamento ? 'Data agendada: ' + new Date(sol.data_agendamento).toLocaleString('pt-BR') : ''}

ID: ${sol.id}`,
  });
}

function notificarConcluido(sol) {
  const destinatarios = [sol.solicitante_email, 'facilities@empresa.com'].filter(Boolean).join(', ');
  logEmail({
    para: destinatarios,
    assunto: `[Facilities] Solicitação concluída: ${sol.tipo} - ${sol.local_area}`,
    corpo: `${GREEN}✅ Sua solicitação de Facilities foi concluída com sucesso!${RESET}

Tipo: ${sol.tipo}
Local: ${sol.local_area}
Responsável: ${sol.responsavel_nome || 'Não definido'}
${sol.observacoes ? 'Observações: ' + sol.observacoes : ''}

ID: ${sol.id}
Concluído em: ${new Date().toLocaleString('pt-BR')}`,
  });
}

function notificarCancelado(sol) {
  const para = sol.solicitante_email || 'facilities@empresa.com';
  logEmail({
    para,
    assunto: `[Facilities] Solicitação cancelada: ${sol.tipo} - ${sol.local_area}`,
    corpo: `${RED}❌ Sua solicitação de Facilities foi cancelada.${RESET}

Tipo: ${sol.tipo}
Local: ${sol.local_area}
${sol.observacoes ? 'Motivo: ' + sol.observacoes : ''}

ID: ${sol.id}
Cancelado em: ${new Date().toLocaleString('pt-BR')}`,
  });
}

module.exports = {
  notificarNovaFacilities,
  notificarResponsavel,
  notificarExecucao,
  notificarConcluido,
  notificarCancelado,
};
