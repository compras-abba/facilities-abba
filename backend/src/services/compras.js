const axios = require('axios');

async function criarSolicitacaoCompras(solFacilities) {
  const comprasUrl = process.env.COMPRAS_API_URL || 'http://localhost:3001';

  const prazo = new Date();
  prazo.setDate(prazo.getDate() + 15);

  const payload = {
    solicitante_nome: solFacilities.responsavel_nome || solFacilities.solicitante_nome,
    solicitante_email: solFacilities.responsavel_email || solFacilities.solicitante_email,
    setor: solFacilities.setor,
    descricao_item: `[FACILITIES #${solFacilities.id.substring(0, 8)}] ${solFacilities.tipo} - ${solFacilities.descricao}`,
    quantidade_unidade: '1 serviço',
    prazo_necessario: prazo.toISOString(),
    justificativa_uso: `Originado de solicitação Facilities: ${solFacilities.local_area} - ${solFacilities.descricao}`,
    categoria_compra: 'Servicos',
  };

  try {
    console.log(`\n🔗 Criando solicitação de compras para Facilities #${solFacilities.id.substring(0, 8)}...`);
    const response = await axios.post(`${comprasUrl}/api/solicitacoes`, payload);
    const scId = response.data?.id || response.data?.solicitacao?.id;
    console.log(`✅ Solicitação de compras criada: ${scId}`);
    return scId;
  } catch (err) {
    console.error(`⚠️  Erro ao criar solicitação de compras: ${err.message}`);
    // Não lança exceção para não bloquear o fluxo
    return null;
  }
}

module.exports = { criarSolicitacaoCompras };
