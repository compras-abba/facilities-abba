const express = require('express');
const supabase = require('../lib/supabase');
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

// GET /api/solicitacoes
router.get('/', autenticar, async (req, res) => {
  try {
    let query = supabase
      .from('solicitacoes_facilities')
      .select('*')
      .order('created_at', { ascending: false });

    if (req.usuario.perfil === 'Solicitante') {
      query = query.eq('solicitante_id', req.usuario.id);
    }
    if (req.query.fase) query = query.eq('fase_atual', req.query.fase);
    if (req.query.tipo) query = query.eq('tipo', req.query.tipo);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Erro ao listar solicitações:', err);
    res.status(500).json({ error: 'Erro ao listar solicitações' });
  }
});

// GET /api/solicitacoes/:id
router.get('/:id', autenticar, async (req, res) => {
  try {
    const { data: sol, error } = await supabase
      .from('solicitacoes_facilities')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !sol) return res.status(404).json({ error: 'Solicitação não encontrada' });
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

    const { data: sol, error } = await supabase
      .from('solicitacoes_facilities')
      .insert({
        solicitante_nome,
        solicitante_email: solicitante_email || req.usuario.email,
        solicitante_id: req.usuario.id,
        setor,
        tipo,
        local_area,
        local_detalhe,
        descricao,
        prioridade: prioridade || 'Media',
        fase_atual: 'Triagem',
        anexos: [],
        historico: [{ fase: 'Triagem', data: new Date().toISOString(), acao: 'Solicitação criada' }],
      })
      .select('*')
      .single();

    if (error) throw error;

    notificarNovaFacilities(sol);
    res.status(201).json(sol);
  } catch (err) {
    console.error('Erro ao criar solicitação:', err);
    res.status(500).json({ error: 'Erro ao criar solicitação' });
  }
});

// PATCH /api/solicitacoes/:id
router.patch('/:id', autenticar, async (req, res) => {
  try {
    const { id } = req.params;
    const body = { ...req.body };

    const { data: anterior } = await supabase
      .from('solicitacoes_facilities')
      .select('*')
      .eq('id', id)
      .single();

    if (!anterior) return res.status(404).json({ error: 'Solicitação não encontrada' });

    const updateData = { ...body };

    // Atualizar histórico se fase mudou
    if (body.fase_atual && body.fase_atual !== anterior.fase_atual) {
      const novoHistorico = [...(anterior.historico || []), {
        fase: body.fase_atual,
        data: new Date().toISOString(),
        acao: body.observacao_historico || `Movido para ${body.fase_atual}`,
      }];
      updateData.historico = novoHistorico;
    }
    delete updateData.observacao_historico;

    // Datas automáticas
    if (body.fase_atual === 'Execucao' && !anterior.data_execucao) {
      updateData.data_execucao = new Date().toISOString();
    }
    if (body.fase_atual === 'Concluido' && !anterior.data_conclusao) {
      updateData.data_conclusao = new Date().toISOString();
    }

    const { data: atualizado, error } = await supabase
      .from('solicitacoes_facilities')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    // Gatilhos de notificação/integração por fase
    if (body.fase_atual && body.fase_atual !== anterior.fase_atual) {
      switch (body.fase_atual) {
        case 'Diagnostico':
          notificarResponsavel(atualizado);
          break;

        case 'AguardandoCompras': {
          const scId = await criarSolicitacaoCompras(atualizado);
          if (scId) {
            await supabase
              .from('solicitacoes_facilities')
              .update({ solicitacao_compra_id: scId })
              .eq('id', id);
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
    const { error } = await supabase
      .from('solicitacoes_facilities')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Solicitação removida com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar solicitação:', err);
    res.status(500).json({ error: 'Erro ao deletar solicitação' });
  }
});

module.exports = router;
