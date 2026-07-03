import React, { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import SolicitacaoModal from './components/SolicitacaoModal';
import NovaFacilitiesForm from './components/NovaFacilitiesForm';
import LoginForm from './components/LoginForm';
import SolicitanteView from './components/SolicitanteView';
import { listarSolicitacoes, atualizarSolicitacao, getMe, logout } from './api';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalSol, setModalSol] = useState(null);
  const [formAberto, setFormAberto] = useState(false);

  // Verifica token salvo ao montar
  useEffect(() => {
    async function verificarAuth() {
      try {
        const me = await getMe();
        setUsuario(me);
      } catch {
        // token inválido ou ausente — vai para login
        setUsuario(null);
      } finally {
        setAuthChecked(true);
      }
    }
    verificarAuth();
  }, []);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const dados = await listarSolicitacoes();
      setSolicitacoes(dados);
    } catch {
      toast.error('Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega solicitações só para Admin/Responsavel (o KanbanBoard)
  useEffect(() => {
    if (usuario && usuario.perfil !== 'Solicitante') {
      carregar();
    }
  }, [usuario, carregar]);

  async function handleAtualizar(id, dados) {
    const atualizado = await atualizarSolicitacao(id, dados);
    setSolicitacoes(prev => prev.map(s => s.id === id ? atualizado : s));
    if (modalSol?.id === id) setModalSol(atualizado);
    return atualizado;
  }

  function handleCriada(nova) {
    setSolicitacoes(prev => [nova, ...prev]);
  }

  function handleLogout() {
    logout();
    setUsuario(null);
    setSolicitacoes([]);
  }

  // Aguarda verificação de auth antes de renderizar
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a3068]">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Tela de login
  if (!usuario) {
    return (
      <>
        <LoginForm onLogin={setUsuario} />
        <Toaster position="bottom-right" toastOptions={{ duration: 3500, style: { borderRadius: '8px', fontSize: '14px' } }} />
      </>
    );
  }

  // Solicitante — tela simplificada
  if (usuario.perfil === 'Solicitante') {
    return (
      <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
        <Header usuario={usuario} onLogout={handleLogout} />
        <SolicitanteView usuario={usuario} />
        <Toaster position="bottom-right" toastOptions={{ duration: 3500, style: { borderRadius: '8px', fontSize: '14px' } }} />
      </div>
    );
  }

  // Admin / Responsavel — Kanban completo
  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      <Header
        usuario={usuario}
        onLogout={handleLogout}
        onNova={() => setFormAberto(true)}
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[#1a3068] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Carregando solicitações...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <KanbanBoard
            solicitacoes={solicitacoes}
            onAtualizar={handleAtualizar}
            onAbrirModal={sol => setModalSol(sol)}
          />
        </div>
      )}

      {modalSol && (
        <SolicitacaoModal
          solicitacao={modalSol}
          onFechar={() => setModalSol(null)}
          onAtualizar={handleAtualizar}
          usuario={usuario}
        />
      )}

      {formAberto && (
        <NovaFacilitiesForm
          onFechar={() => setFormAberto(false)}
          onCriada={handleCriada}
          usuario={usuario}
        />
      )}

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: { borderRadius: '8px', fontSize: '14px' },
        }}
      />
    </div>
  );
}
