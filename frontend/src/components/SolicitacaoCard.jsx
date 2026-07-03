import React from 'react';
import { MapPin, Link2 } from 'lucide-react';

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

const PRIORIDADE_CORES = {
  Urgente: 'bg-red-100 text-red-800 border border-red-200',
  Alta:    'bg-orange-100 text-orange-800 border border-orange-200',
  Media:   'bg-yellow-100 text-yellow-800 border border-yellow-200',
  Baixa:   'bg-gray-100 text-gray-600 border border-gray-200',
};

export default function SolicitacaoCard({ solicitacao, onClick }) {
  const { tipo, descricao, local_area, prioridade, solicitacao_compra_id } = solicitacao;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-purple-200 transition-all select-none"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIPO_CORES[tipo] || 'bg-gray-100 text-gray-700'}`}>
          {TIPO_LABELS[tipo] || tipo}
        </span>
        {solicitacao_compra_id && (
          <span title={`SC: ${solicitacao_compra_id}`} className="text-orange-500">
            <Link2 size={14} />
          </span>
        )}
      </div>

      <p className="text-sm text-gray-800 font-medium line-clamp-2 mb-2">{descricao}</p>

      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
        <MapPin size={11} />
        <span className="truncate">{local_area}</span>
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORIDADE_CORES[prioridade] || ''}`}>
          {prioridade}
        </span>
        {solicitacao.responsavel_nome && (
          <span className="text-xs text-gray-400 truncate max-w-[80px]">{solicitacao.responsavel_nome}</span>
        )}
      </div>
    </div>
  );
}
