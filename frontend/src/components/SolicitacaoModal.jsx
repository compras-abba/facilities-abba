import React, { useState, useEffect } from 'react';
import { X, Link2, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const FASE_LABELS = {
  Triagem:           'Triagem',
  Diagnostico:       'Diagnóstico',
  Agendamento:       'Agendamento',
  AguardandoCompras: 'Aguardando Compras',
  Execucao:          'Execução',
  Validacao:         'Validação',
  Concluido:         'Concluído',
  Cancelado:         'Cancelado',
};

const FASE_CORES = {
  Triagem:           'bg-gray-100 text-gray-700',
  Diagnostico:       'bg-blue-100 text-blue-700',
  Agendamento:       'bg-yellow-100 text-yellow-700',
  AguardandoCompras: 'bg-orange-100 text-orange-700',
  Execucao:          'bg-purple-100 text-purple-700',
  Validacao:         'bg-cyan-100 text-cyan-700',
  Concluido:         'bg-green-100 text-green-700',
  Cancelado:         'bg-red-100 text-red-700',
};

const TIPO_LABELS = {
  Manutencao: 'Manutenção',
  Instalacao:  'Instalação',
  Limpeza:     'Limpeza',
  Reparo:      'Reparo',
  Licenca:     'Licença',
};

export default function SolicitacaoModal({ solicitacao, onFechar, onAtualizar, usuario }) {
  const [form, setForm] = useState({
    responsavel_nome: solicitacao.responsavel_nome || '',
    responsavel_email: solicitacao.responsavel_email || '',
    diagnostico: solicitacao.diagnostico || '',
    observacoes: solicitacao.observacoes || '',
    data_agendamento: solicitacao.data_agendamento
      ? new Date(solicitacao.data_agendamento).toISOString().slice(0, 16)
      : '',
  });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onFechar(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onFechar]);

  async function salvarCampos() {
    setSalvando(true);
    try {
      await onAtualizar(solicitacao.id, {
        responsavel_nome: form.responsavel_nome || undefined,
        responsavel_email: form.responsavel_email || undefined,
        diagnostico: form.diagnostico || undefined,
        observacoes: form.observacoes || undefined,
        data_agendamento: form.data_agendamento ? new Date(form.data_agendamento).toISOString() : undefined,
      });
      toast.success('Salvo com sucesso');
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setSalvando(false);
    }
  }

  async function mudarFase(novaFase, observacao) {
    setSalvando(true);
    try {
      await onAtualizar(solicitacao.id, {
        fase_atual: novaFase,
        observacao_historico: observacao,
      });
      toast.success(`Movido para: ${FASE_LABELS[novaFase]}`);
      onFechar();
    } catch {
      toast.error('Erro ao mudar fase');
    } finally {
      setSalvando(false);
    }
  }

  const fase = solicitacao.fase_atual;
  const finalizado = fase === 'Concluido' || fase === 'Cancelado';
  const isSolicitante = usuario?.perfil === 'Solicitante';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${FASE_CORES[fase]}`}>
                {FASE_LABELS[fase]}
              </span>
              {solicitacao.solicitacao_compra_id && (
                <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                  <Link2 size={11} />
                  SC: {solicitacao.solicitacao_compra_id.substring(0, 8)}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              {TIPO_LABELS[solicitacao.tipo] || solicitacao.tipo} — {solicitacao.local_area}
            </h2>
            <p className="text-sm text-gray-500">{solicitacao.solicitante_nome} · {solicitacao.setor}</p>
          </div>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600 p-1 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Descrição</label>
            <p className="text-sm text-gray-800 bg-gray-50 rounded p-3">{solicitacao.descricao}</p>
          </div>

          {solicitacao.local_detalhe && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Detalhe do Local</label>
              <p className="text-sm text-gray-700">{solicitacao.local_detalhe}</p>
            </div>
          )}

          {/* Responsável — somente para não-Solicitante e não-finalizado */}
          {!finalizado && !isSolicitante && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Responsável</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  value={form.responsavel_nome}
                  onChange={e => setForm(f => ({ ...f, responsavel_nome: e.target.value }))}
                  placeholder="Nome do responsável"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email Responsável</label>
                <input
                  type="email"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  value={form.responsavel_email}
                  onChange={e => setForm(f => ({ ...f, responsavel_email: e.target.value }))}
                  placeholder="email@empresa.com"
                />
              </div>
            </div>
          )}

          {/* Diagnóstico editar — somente não-Solicitante */}
          {!finalizado && !isSolicitante && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Diagnóstico</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                rows={3}
                value={form.diagnostico}
                onChange={e => setForm(f => ({ ...f, diagnostico: e.target.value }))}
                placeholder="Descreva o diagnóstico..."
              />
            </div>
          )}

          {/* Data agendamento — somente não-Solicitante */}
          {(fase === 'Agendamento' || fase === 'Execucao') && !isSolicitante && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Data de Agendamento</label>
              <input
                type="datetime-local"
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={form.data_agendamento}
                onChange={e => setForm(f => ({ ...f, data_agendamento: e.target.value }))}
              />
            </div>
          )}

          {/* Observações — somente não-Solicitante */}
          {!finalizado && !isSolicitante && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Observações</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                rows={2}
                value={form.observacoes}
                onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
                placeholder="Observações adicionais..."
              />
            </div>
          )}

          {/* Info read-only para finalizados */}
          {finalizado && solicitacao.diagnostico && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Diagnóstico</label>
              <p className="text-sm text-gray-800 bg-gray-50 rounded p-3">{solicitacao.diagnostico}</p>
            </div>
          )}
          {finalizado && solicitacao.observacoes && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Observações</label>
              <p className="text-sm text-gray-800 bg-gray-50 rounded p-3">{solicitacao.observacoes}</p>
            </div>
          )}

          {/* Responsável read-only para Solicitante */}
          {isSolicitante && solicitacao.responsavel_nome && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Responsável</label>
              <p className="text-sm text-gray-800">{solicitacao.responsavel_nome}</p>
            </div>
          )}

          {/* Histórico */}
          {solicitacao.historico && solicitacao.historico.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Histórico</label>
              <div className="space-y-1">
                {solicitacao.historico.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <div className="flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${FASE_CORES[h.fase] ? 'bg-purple-500' : 'bg-gray-300'}`} />
                      {i < solicitacao.historico.length - 1 && <div className="w-0.5 h-4 bg-gray-200 mt-0.5" />}
                    </div>
                    <div>
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${FASE_CORES[h.fase] || 'bg-gray-100 text-gray-600'}`}>
                        {FASE_LABELS[h.fase] || h.fase}
                      </span>
                      <span className="text-gray-500 text-xs ml-2">
                        {new Date(h.data).toLocaleString('pt-BR')}
                      </span>
                      <p className="text-gray-700 text-xs">{h.acao}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex items-center justify-between gap-2 flex-wrap">
          {/* Ações por fase — somente não-Solicitante */}
          {!isSolicitante && (
            <div className="flex gap-2 flex-wrap">
              {fase === 'Triagem' && (
                <button
                  onClick={() => mudarFase('Diagnostico', 'Atribuído para diagnóstico')}
                  disabled={salvando}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  <ChevronRight size={16} /> Atribuir e Diagnosticar
                </button>
              )}

              {fase === 'Diagnostico' && (
                <>
                  <button
                    onClick={() => mudarFase('Agendamento', 'Agendamento solicitado')}
                    disabled={salvando}
                    className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    <ChevronRight size={16} /> Agendar Execução
                  </button>
                  <button
                    onClick={() => mudarFase('AguardandoCompras', 'Requer cotação externa / compras')}
                    disabled={salvando}
                    className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    <Link2 size={16} /> Requer Cotação Externa
                  </button>
                </>
              )}

              {fase === 'Agendamento' && (
                <button
                  onClick={() => mudarFase('Execucao', 'Execução iniciada')}
                  disabled={salvando}
                  className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  <ChevronRight size={16} /> Iniciar Execução
                </button>
              )}

              {fase === 'AguardandoCompras' && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded px-3 py-2">
                    Aguardando aprovação/entrega de Compras.
                    {solicitacao.solicitacao_compra_id && ` SC vinculada: ${solicitacao.solicitacao_compra_id.substring(0, 8)}`}
                  </p>
                  <button
                    onClick={() => mudarFase('Execucao', 'Compras aprovado — execução iniciada')}
                    disabled={salvando}
                    className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    <ChevronRight size={16} /> Compras Aprovado — Iniciar Execução
                  </button>
                </div>
              )}

              {fase === 'Execucao' && (
                <button
                  onClick={() => mudarFase('Validacao', 'Enviado para validação')}
                  disabled={salvando}
                  className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  <ChevronRight size={16} /> Concluir e Validar
                </button>
              )}

              {fase === 'Validacao' && (
                <>
                  <button
                    onClick={() => mudarFase('Concluido', 'Conclusão confirmada')}
                    disabled={salvando}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    <ChevronRight size={16} /> Confirmar Conclusão
                  </button>
                  <button
                    onClick={() => mudarFase('Execucao', 'Devolvido para execução')}
                    disabled={salvando}
                    className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    Devolver para Execução
                  </button>
                </>
              )}
            </div>
          )}

          <div className={`flex gap-2 ${!isSolicitante ? 'ml-auto' : 'w-full justify-end'}`}>
            {/* Botão Cancelar solicitação — oculto para Solicitante */}
            {!finalizado && !isSolicitante && (
              <>
                <button
                  onClick={() => mudarFase('Cancelado', 'Solicitação cancelada')}
                  disabled={salvando}
                  className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarCampos}
                  disabled={salvando}
                  className="flex items-center gap-1.5 bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {salvando ? <Loader2 size={14} className="animate-spin" /> : null}
                  Salvar
                </button>
              </>
            )}
            <button
              onClick={onFechar}
              className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
