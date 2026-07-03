import React, { useState, useEffect } from 'react';
import { X, Loader2, UserCheck, UserX, Pencil, Check } from 'lucide-react';
import { listarUsuarios, atualizarUsuario } from '../api';
import toast from 'react-hot-toast';

const PERFIS = ['Admin', 'Responsavel', 'Solicitante'];

const PERFIL_BADGE = {
  Admin:       'bg-purple-100 text-purple-800',
  Responsavel: 'bg-blue-100 text-blue-800',
  Solicitante: 'bg-green-100 text-green-800',
};

export default function GestaoUsuarios({ onFechar }) {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [editandoId, setEditandoId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onFechar(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onFechar]);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    try {
      setUsuarios(await listarUsuarios());
    } catch {
      toast.error('Erro ao carregar usuários');
    } finally {
      setCarregando(false);
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

  function iniciarEdicao(usuario) {
    setEditandoId(usuario.id);
    setEditForm({ nome: usuario.nome, perfil: usuario.perfil });
  }

  async function salvarEdicao(id) {
    try {
      const atualizado = await atualizarUsuario(id, editForm);
      setUsuarios(prev => prev.map(u => u.id === id ? atualizado : u));
      setEditandoId(null);
      toast.success('Usuário atualizado');
    } catch {
      toast.error('Erro ao salvar');
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-900">Gestão de Usuários</h2>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600 p-1 rounded">
            <X size={20} />
          </button>
        </div>

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
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Editar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuarios.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {editandoId === u.id ? (
                        <input
                          className="border rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-[#1a3068]"
                          value={editForm.nome}
                          onChange={e => setEditForm(f => ({ ...f, nome: e.target.value }))}
                        />
                      ) : u.nome}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      {editandoId === u.id ? (
                        <select
                          className="border rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#1a3068]"
                          value={editForm.perfil}
                          onChange={e => setEditForm(f => ({ ...f, perfil: e.target.value }))}
                        >
                          {PERFIS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${PERFIL_BADGE[u.perfil] || 'bg-gray-100 text-gray-700'}`}>
                          {u.perfil}
                        </span>
                      )}
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
                    <td className="px-4 py-3 text-center">
                      {editandoId === u.id ? (
                        <button
                          onClick={() => salvarEdicao(u.id)}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold transition-colors"
                        >
                          <Check size={12} /> Salvar
                        </button>
                      ) : (
                        <button
                          onClick={() => iniciarEdicao(u)}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 font-semibold transition-colors"
                        >
                          <Pencil size={12} /> Editar
                        </button>
                      )}
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
