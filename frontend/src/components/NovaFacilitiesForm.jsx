import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { criarSolicitacao } from '../api';
import toast from 'react-hot-toast';

const SETORES = ['Producao', 'Manutencao', 'Administrativo', 'Logistica', 'Qualidade', 'Comercial', 'Diretoria'];
const TIPOS   = [
  { value: 'Manutencao', label: 'Manutenção' },
  { value: 'Instalacao',  label: 'Instalação' },
  { value: 'Limpeza',     label: 'Limpeza' },
  { value: 'Reparo',      label: 'Reparo' },
  { value: 'Licenca',     label: 'Licença' },
];
const PRIORIDADES = [
  { value: 'Baixa',   label: 'Baixa' },
  { value: 'Media',   label: 'Média' },
  { value: 'Alta',    label: 'Alta' },
  { value: 'Urgente', label: 'Urgente' },
];

const VAZIO = {
  solicitante_nome: '',
  solicitante_email: '',
  setor: '',
  tipo: '',
  local_area: '',
  local_detalhe: '',
  descricao: '',
  prioridade: 'Media',
};

export default function NovaFacilitiesForm({ onFechar, onCriada }) {
  const [form, setForm] = useState(VAZIO);
  const [enviando, setEnviando] = useState(false);

  function set(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.solicitante_nome || !form.setor || !form.tipo || !form.local_area || !form.descricao) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setEnviando(true);
    try {
      const nova = await criarSolicitacao(form);
      toast.success('Solicitação aberta com sucesso!');
      onCriada(nova);
      onFechar();
    } catch {
      toast.error('Erro ao criar solicitação');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-900">Nova Solicitação de Facilities</h2>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600 p-1 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Solicitante <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={form.solicitante_nome}
                onChange={e => set('solicitante_nome', e.target.value)}
                placeholder="Seu nome"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
              <input
                type="email"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={form.solicitante_email}
                onChange={e => set('solicitante_email', e.target.value)}
                placeholder="email@empresa.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Setor <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                value={form.setor}
                onChange={e => set('setor', e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                {SETORES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Tipo <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                value={form.tipo}
                onChange={e => set('tipo', e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Local / Área <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={form.local_area}
                onChange={e => set('local_area', e.target.value)}
                placeholder="Ex: Galpão A"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Detalhe do Local</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={form.local_detalhe}
                onChange={e => set('local_detalhe', e.target.value)}
                placeholder="Ex: Próximo à porta 3"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Descrição <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              rows={4}
              value={form.descricao}
              onChange={e => set('descricao', e.target.value)}
              placeholder="Descreva o problema ou serviço necessário com detalhes..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Prioridade</label>
            <div className="flex gap-2">
              {PRIORIDADES.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => set('prioridade', p.value)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                    form.prioridade === p.value
                      ? p.value === 'Urgente' ? 'bg-red-600 text-white border-red-600'
                        : p.value === 'Alta' ? 'bg-orange-500 text-white border-orange-500'
                        : p.value === 'Media' ? 'bg-yellow-500 text-white border-yellow-500'
                        : 'bg-gray-500 text-white border-gray-500'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </form>

        <div className="border-t p-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onFechar}
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={enviando}
            className="flex items-center gap-2 bg-purple-700 hover:bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {enviando && <Loader2 size={14} className="animate-spin" />}
            Abrir Solicitação
          </button>
        </div>
      </div>
    </div>
  );
}
