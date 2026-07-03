import React, { useState, useEffect } from 'react';
import { X, Plus, Loader2, UserCheck, UserX } from 'lucide-react';
import { listarUsuarios, criarUsuario, atualizarUsuario } from '../api';
import toast from 'react-hot-toast';

const PERFIS = ['Admin', 'Responsavel', 'Solicitante'];

const PERFIL_BADGE = {
  Admin:       'bg-purple-100 text-purple-800',
  Responsavel: 'bg-blue-100 text-blue-800',
  Solicitante: 'bg-green-100 text-green-800',
};

const VAZIO_FORM = { nome: '', email: '', senha: '', perfil: 'Solicitante' };

export default function GestaoUsuarios({ onFechar }) {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState(VAZIO_FORM);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onFechar(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onFechar]);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    try {
      const lista = await listarUsuarios();
      setUsuarios(lista);
    } catch {
      toast.error('Erro ao carregar usuários');
    } finally {
      setCarregando(false);
    }
  }

  async function handleCriar(e) {
    e.preventDefault();
    if (!form.nome || !form.email || !form.senha || !form.perfil) {
      toast.error('Preencha todos os campos');
      return;
    }
    setSalvando(true);
    try {
      const novo = await criarUsuario(form);
      setUsuarios(prev => [...prev, novo]);
      setForm(VAZIO_FORM);
      setFormAberto(false);
      toast.success('Usuário criado com sucesso');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erro ao criar usuário');
    } finally {
      setSalvando(false);
    }
  }

  async function toggleAtivo(usuario) {
    try {
      const atualizado = await atualizarUsuario(usuario.id, { ativo: !usuario.ativo });
      setUsuarios(prev => prev.map(u => u.id === usuario.id ? atualizado : u));
      toast.success(atualizado.ativo ? 'Usuário ativado' : 'Usuário desativado');
    } catch {
      toast.error('Erro ao atualizar usuário');
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-900">Gestão de Usuários</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setFormAberto(v => !v); setForm(VAZIO_FORM); }}
              className="flex items-center gap-1.5 bg-[#1a3068] hover:bg-[#142554] text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              <Plus size={15} />
              Novo Usuário
            </button>
            <button onClick={onFechar} className="text-gray-400 hover:text-gray-600 p-1 rounded">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form inline para novo usuário */}
        {formAberto && (
          <form onSubmit={handleCriar} className="border-b bg-blue-50 p-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nome *</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3068]"
                value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                placeholder="Nome completo"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
              <input
                type="email"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3068]"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="email@empresa.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Senha *</label>
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3068]"
                value={form.senha}
                onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Perfil *</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3068] bg-white"
                value={form.perfil}
                onChange={e => setForm(f => ({ ...f, perfil: e.target.value }))}
                required
              >
                {PERFIS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFormAberto(false)}
                className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {salvando && <Loader2 size={13} className="animate-spin" />}
                Criar Usuário
              </button>
            </div>
          </form>
        )}

        {/* Tabela */}
        <div className="flex-1 overflow-y-auto">
          {carregando ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : usuarios.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">Nenhum usuário encontrado.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Nome</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Perfil</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ativo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuarios.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">{u.nome}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${PERFIL_BADGE[u.perfil] || 'bg-gray-100 text-gray-700'}`}>
                        {u.perfil}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleAtivo(u)}
                        title={u.ativo ? 'Desativar' : 'Ativar'}
                        className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${
                          u.ativo
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {u.ativo ? <><UserCheck size={12} /> Ativo</> : <><UserX size={12} /> Inativo</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
