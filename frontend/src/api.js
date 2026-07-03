import { supabase } from './lib/supabase'

// Auth
export async function login(email, senha) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
  if (error) throw error
  return data
}

export async function logout() {
  await supabase.auth.signOut()
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getPerfil(userId) {
  const { data } = await supabase
    .from('usuarios_facilities')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

// Usuários
export async function listarUsuarios() {
  const { data } = await supabase
    .from('usuarios_facilities')
    .select('id, nome, email, perfil, ativo, created_at')
    .order('nome')
  return data || []
}

export async function atualizarUsuario(id, dados) {
  const { data, error } = await supabase
    .from('usuarios_facilities')
    .update(dados)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function criarUsuario(dados) {
  const { data, error } = await supabase.functions.invoke('clever-handler', {
    body: dados
  })
  if (error) throw error
  return data
}

// Solicitações
export async function listarSolicitacoes(filtros = {}) {
  let query = supabase
    .from('solicitacoes_facilities')
    .select('*')
    .order('created_at', { ascending: false })
  if (filtros.fase) query = query.eq('fase_atual', filtros.fase)
  const { data } = await query
  return data || []
}

export async function criarSolicitacao(dados) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('solicitacoes_facilities')
    .insert({
      ...dados,
      solicitante_id: user.id,
      fase_atual: 'Triagem',
      historico: [{ fase: 'Triagem', data: new Date().toISOString(), usuario: dados.solicitante_nome }]
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function atualizarSolicitacao(id, dados, usuarioNome) {
  let updateData = { ...dados }
  if (dados.fase_atual) {
    const { data: atual } = await supabase
      .from('solicitacoes_facilities')
      .select('*')
      .eq('id', id)
      .single()
    const historico = [...(atual?.historico || []), {
      fase: dados.fase_atual,
      data: new Date().toISOString(),
      usuario: usuarioNome || ''
    }]
    updateData.historico = historico
    if (dados.fase_atual === 'Concluido') {
      updateData.data_conclusao = new Date().toISOString()
    }

    // Notificação por email
    try {
      await supabase.functions.invoke('send-notification', {
        body: {
          fase_nova: dados.fase_atual,
          solicitacao: { ...atual, ...dados },
          usuario_nome: usuarioNome || '',
        }
      })
    } catch {}
  }
  const { data, error } = await supabase
    .from('solicitacoes_facilities')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletarSolicitacao(id) {
  const { error } = await supabase
    .from('solicitacoes_facilities')
    .delete()
    .eq('id', id)
  if (error) throw error
}
