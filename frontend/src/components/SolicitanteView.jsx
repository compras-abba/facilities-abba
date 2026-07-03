import React, { useState, useEffect, useCallback } from 'react';
import { Plus, MapPin, Calendar, ClipboardList } from 'lucide-react';
import { listarSolicitacoes } from '../api';
import NovaFacilitiesForm from './NovaFacilitiesForm';
import toast from 'react-hot-toast';

const TIPO_CORES = {
  Manutencao: 'bg-blue-100 text-blue-800',
  Instalacao:  'bg-indigo-100 text-indigo-800',
  Limpeza:     'bg-teal-100 text-teal-800',
  Reparo:      'bg-orange-100 text-orange-800',
  Licenca:     'bg-pink-100 text-pink-800',
};

const TIPO_LABELS = {
  Manutencao: 'Manutenção',
  Instalacao:  'Instalação',
  Limpeza:     'Limpeza',
  Reparo:      'Reparo',
  Licenca:     'Licença',
};

const FASE_LABELS = {
  Triagem:           'Triagem',
  Diagnostico:       'Diagnóstico',
  Agendamento:       'Agendamento',
  AguardandoCompras: 'Aguard. Compras',
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

const PRIORIDADE_CORES = {
  Urgente: 'bg-red-100 text-red-800 border border-red-200',
  Alta:    'bg-orange-100 text-orange-800 border border-orange-200',
  Media:   'bg-yellow-100 text-yellow-800 border border-yellow-200',
  Baixa:   'bg-gray-100 text-gray-600 border border-gray-200',
};

function DetalheModal({ solicitacao, onFechar }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onFechar(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onFechar]);

  const fase = solicitacao.fase_atual;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-start justify-between p-5 border-b">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIPO_CORES[solicitacao.tipo] || 'bg-gray-100 text-gray-700'}`}>
                {TIPO_LABELS[solicitacao.tipo] || solicitacao.tipo}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${FASE_CORES[fase]}`}>
                {FASE_LABELS[fase]}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORIDADE_CORES[solicitacao.prioridade] || ''}`}>
                {solicitacao.prioridade}
              </span>
            </div>
            <h2 className="text-base font-bold text-gray-900">{solicitacao.local_area}</h2>
            <p className="text-xs text-gray-500">{new Date(solicitacao.created_at).toLocaleString('pt-BR')}</p>
          </div>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600 p-1 rounded text-xl leading-none">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
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

          {solicitacao.diagnostico && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Diagnóstico</label>
              <p className="text-sm text-gray-800 bg-gray-50 rounded p-3">{solicitacao.diagnostico}</p>
            </div>
          )}

          {solicitacao.responsavel_nome && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Responsável</label>
              <p className="text-sm text-gray-800">{solicitacao.responsavel_nome}</p>
            </div>
          )}

          {/* Histórico */}
          {solicitacao.historico && solicitacao.historico.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Histórico</label>
              <div className="space-y-2">
                {solicitacao.historico.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <div className="flex flex-col items-center pt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
                      {i < solicitacao.historico.length - 1 && <div className="w-0.5 h-4 bg-gray-200 mt-0.5" />}
                    </div>
                    <div>
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${FASE_CORES[h.fase] || 'bg-gray-100 text-gray-600'}`}>
                        {FASE_LABELS[h.fase] || h.fase}
                      </span>
                      <span className="text-gray-400 text-xs ml-2">{new Date(h.data).toLocaleString('pt-BR')}</span>
                      {h.acao && <p className="text-gray-600 text-xs mt-0.5">{h.acao}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onFechar}
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SolicitanteView({ usuario }) {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [detalhe, setDetalhe] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const dados = await listarSolicitacoes();
      // Ordena por created_at desc
      const ordenado = [...dados].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setSolicitacoes(ordenado);
    } catch {
      toast.error('Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  function handleCriada(nova) {
    setSolicitacoes(prev => [nova, ...prev]);
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#1a3068] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Carregando suas solicitações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Minhas Solicitações</h2>
          <span className="text-sm text-gray-500">{solicitacoes.length} no total</span>
        </div>

        {solicitacoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ClipboardList size={56} className="text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Nenhuma solicitação ainda.</p>
            <p className="text-gray-400 text-sm mt-1">Clique em <strong>+</strong> para abrir uma.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {solicitacoes.map(sol => (
              <div
                key={sol.id}
                onClick={() => setDetalhe(sol)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-wrap gap-1.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIPO_CORES[sol.tipo] || 'bg-gray-100 text-gray-700'}`}>
                      {TIPO_LABELS[sol.tipo] || sol.tipo}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${FASE_CORES[sol.fase_atual]}`}>
                      {FASE_LABELS[sol.fase_atual]}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${PRIORIDADE_CORES[sol.prioridade] || ''}`}>
                    {sol.prioridade}
                  </span>
                </div>

                <p className="text-sm text-gray-800 font-medium line-clamp-2 mb-2">{sol.descricao}</p>

                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {sol.local_area}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date(sol.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botão flutuante + */}
      <button
        onClick={() => setFormAberto(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#1a3068] hover:bg-[#142554] text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-light transition-all hover:scale-110 z-40"
        title="Nova Solicitação"
      >
        <Plus size={24} />
      </button>

      {formAberto && (
        <NovaFacilitiesForm
          onFechar={() => setFormAberto(false)}
          onCriada={handleCriada}
          usuario={usuario}
        />
      )}

      {detalhe && (
        <DetalheModal
          solicitacao={detalhe}
          onFechar={() => setDetalhe(null)}
        />
      )}
    </div>
  );
}
