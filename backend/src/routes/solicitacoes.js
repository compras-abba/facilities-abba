const express = require('express');
const { PrismaClient } = require('@prisma/client');
const {
  notificarNovaFacilities,
  notificarResponsavel,
  notificarExecucao,
  notificarConcluido,
  notificarCancelado,
} = require('../services/notifications');
const { criarSolicitacaoCompras } = require('../services/compras');
const { autenticar, exigirPerfil } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/solicitacoes
router.get('/', autenticar, async (req, res) => {
  try {
    const { fase, tipo } = req.query;
    const where = {};
    if (fase) where.fase_atual = fase;
    if (tipo) where.tipo = tipo;

    // Solicitante só vê as próprias solicitações
    if (req.usuario.perfil === 'Solicitante') {
      where.solicitante_id = req.usuario.id;
    }

    const solicitacoes = await prisma.solicitacaoFacilities.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
    res.json(solicitacoes);
  } catch (err) {
    console.error('Erro ao listar solicitações:', err);
    res.status(500).json({ error: 'Erro ao listar solicitações' });
  }
});

// GET /api/solicitacoes/:id
router.get('/:id', autenticar, async (req, res) => {
  try {
    const sol = await prisma.solicitacaoFacilities.findUnique({
      where: { id: req.params.id },
    });
    if (!sol) return res.status(404).json({ error: 'Solicitação não encontrada' });
    res.json(sol);
  } catch (err) {
    console.error('Erro ao buscar solicitação:', err);
    res.status(500).json({ error: 'Erro ao buscar solicitação' });
  }
});

// POST /api/solicitacoes
router.post('/', autenticar, async (req, res) => {
  try {
    const {
      solicitante_nome,
      solicitante_email,
      setor,
      tipo,
      local_area,
      local_detalhe,
      descricao,
      prioridade,
    } = req.body;

    if (!solicitante_nome || !setor || !tipo || !local_area || !descricao) {
      return res.status(400).json({ error: 'Campos obrigatórios: solicitante_nome, setor, tipo, local_area, descricao' });
    }

    const historico = [
      { fase: 'Triagem', data: new Date().toISOString(), acao: 'Solicitação criada' },
    ];

    const nova = await prisma.solicitacaoFacilities.create({
      data: {
        solicitante_nome,
        solicitante_email,
        solicitante_id: req.usuario.id,
        setor,
        tipo,
        local_area,
        local_detalhe,
        descricao,
        prioridade: prioridade || 'Media',
        historico,
        anexos: [],
      },
    });

    notificarNovaFacilities(nova);

    res.status(201).json(nova);
  } catch (err) {
    console.error('Erro ao criar solicitação:', err);
    res.status(500).json({ error: 'Erro ao criar solicitação' });
  }
});

// PATCH /api/solicitacoes/:id
router.patch('/:id', autenticar, async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    const anterior = await prisma.solicitacaoFacilities.findUnique({ where: { id } });
    if (!anterior) return res.status(404).json({ error: 'Solicitação não encontrada' });

    // Atualizar histórico se fase mudou
    const novoHistorico = [...(anterior.historico || [])];
    if (data.fase_atual && data.fase_atual !== anterior.fase_atual) {
      novoHistorico.push({
        fase: data.fase_atual,
        data: new Date().toISOString(),
        acao: data.observacao_historico || `Movido para ${data.fase_atual}`,
      });
      data.historico = novoHistorico;
    }
    delete data.observacao_historico;

    // Datas automáticas
    if (data.fase_atual === 'Execucao' && !anterior.data_execucao) {
      data.data_execucao = new Date();
    }
    if (data.fase_atual === 'Concluido' && !anterior.data_conclusao) {
      data.data_conclusao = new Date();
    }

    const atualizado = await prisma.solicitacaoFacilities.update({
      where: { id },
      data,
    });

    // Gatilhos de notificação/integração por fase
    if (data.fase_atual && data.fase_atual !== anterior.fase_atual) {
      switch (data.fase_atual) {
        case 'Diagnostico':
          notificarResponsavel(atualizado);
          break;

        case 'AguardandoCompras': {
          const scId = await criarSolicitacaoCompras(atualizado);
          if (scId) {
            await prisma.solicitacaoFacilities.update({
              where: { id },
              data: { solicitacao_compra_id: scId },
            });
            atualizado.solicitacao_compra_id = scId;
          }
          break;
        }

        case 'Execucao':
          notificarExecucao(atualizado);
          break;

        case 'Concluido':
          notificarConcluido(atualizado);
          break;

        case 'Cancelado':
          notificarCancelado(atualizado);
          break;
      }
    }

    res.json(atualizado);
  } catch (err) {
    console.error('Erro ao atualizar solicitação:', err);
    res.status(500).json({ error: 'Erro ao atualizar solicitação' });
  }
});

// DELETE /api/solicitacoes/:id
router.delete('/:id', autenticar, exigirPerfil('Admin', 'Responsavel'), async (req, res) => {
  try {
    await prisma.solicitacaoFacilities.delete({ where: { id: req.params.id } });
    res.json({ message: 'Solicitação removida com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar solicitação:', err);
    res.status(500).json({ error: 'Erro ao deletar solicitação' });
  }
});

module.exports = router;
