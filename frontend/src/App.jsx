import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { supabase } from './lib/supabase'
import { getPerfil } from './api'
import LoginForm from './components/LoginForm'
import Header from './components/Header'
import KanbanBoard from './components/KanbanBoard'
import SolicitacaoModal from './components/SolicitacaoModal'
import NovaFacilitiesForm from './components/NovaFacilitiesForm'
import SolicitanteView from './components/SolicitanteView'

export default function App() {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalSol, setModalSol] = useState(null)
  const [formAberto, setFormAberto] = useState(false)
  const [solicitacoes, setSolicitacoes] = useState([])

  useEffect(() => {
    // Verifica sessão atual
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const perfil = await getPerfil(session.user.id)
        if (perfil) setUsuario({ ...session.user, ...perfil })
      }
      setLoading(false)
    })

    // Escuta mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const perfil = await getPerfil(session.user.id)
        if (perfil) setUsuario({ ...session.user, ...perfil })
      } else if (event === 'SIGNED_OUT') {
        setUsuario(null)
        setSolicitacoes([])
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleAtualizar(id, dados) {
    const { atualizarSolicitacao } = await import('./api')
    const atualizado = await atualizarSolicitacao(id, dados, usuario?.nome)
    setSolicitacoes(prev => prev.map(s => s.id === id ? atualizado : s))
    if (modalSol?.id === id) setModalSol(atualizado)
    return atualizado
  }

  function handleCriada(nova) {
    setSolicitacoes(prev => [nova, ...prev])
  }

  if (loading) return (
    <div className="min-h-screen bg-[#1a3068] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!usuario) return (
    <>
      <LoginForm />
      <Toaster position="bottom-right" toastOptions={{ duration: 3500, style: { borderRadius: '8px', fontSize: '14px' } }} />
    </>
  )

  if (usuario.perfil === 'Solicitante') {
    return (
      <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
        <Header usuario={usuario} onLogout={() => supabase.auth.signOut()} />
        <SolicitanteView usuario={usuario} />
        <Toaster position="bottom-right" toastOptions={{ duration: 3500, style: { borderRadius: '8px', fontSize: '14px' } }} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      <Header
        usuario={usuario}
        onLogout={() => supabase.auth.signOut()}
        onNova={() => setFormAberto(true)}
      />
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          usuario={usuario}
          solicitacoes={solicitacoes}
          setSolicitacoes={setSolicitacoes}
          onAtualizar={handleAtualizar}
          onAbrirModal={sol => setModalSol(sol)}
        />
      </div>

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
          usuario={usuario}
          onFechar={() => setFormAberto(false)}
          onCriada={(nova) => { handleCriada(nova); setFormAberto(false) }}
        />
      )}

      <Toaster position="bottom-right" toastOptions={{ duration: 3500, style: { borderRadius: '8px', fontSize: '14px' } }} />
    </div>
  )
}
