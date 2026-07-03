import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import logoAbba from '../assets/logo-abba.png'

export default function LoginForm() {
  const [aba, setAba] = useState('login')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) setErro('Email ou senha inválidos.')
    setCarregando(false)
  }

  async function handleRegistro(e) {
    e.preventDefault()
    setErro('')
    setSucesso('')
    if (!nome.trim()) return setErro('Informe seu nome.')
    setCarregando(true)
    const { data, error } = await supabase.auth.signUp({ email, password: senha })
    if (error) {
      setErro(error.message === 'User already registered' ? 'Email já cadastrado.' : 'Erro ao criar conta.')
      setCarregando(false)
      return
    }
    if (data?.user) {
      await supabase.from('usuarios_facilities').insert({
        id: data.user.id,
        nome: nome.trim(),
        email,
        perfil: 'Solicitante',
      })
    }
    setSucesso('Conta criada! Verifique seu email para confirmar o cadastro.')
    setCarregando(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a3068]">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img src={logoAbba} alt="ABBA" className="h-16 object-contain mb-2" />
          <p className="text-sm text-gray-400 font-medium tracking-wider">Facilities</p>
        </div>

        {/* Abas */}
        <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
          <button
            onClick={() => { setAba('login'); setErro(''); setSucesso('') }}
            className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-colors ${aba === 'login' ? 'bg-white text-[#1a3068] shadow' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Entrar
          </button>
          <button
            onClick={() => { setAba('registro'); setErro(''); setSucesso('') }}
            className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-colors ${aba === 'registro' ? 'bg-white text-[#1a3068] shadow' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={aba === 'login' ? handleLogin : handleRegistro} className="space-y-4">
          {aba === 'registro' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nome completo</label>
              <input
                type="text"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3068] focus:border-transparent"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Seu nome"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
            <input
              type="email"
              autoComplete="email"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3068] focus:border-transparent"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Senha</label>
            <div className="relative">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete={aba === 'login' ? 'current-password' : 'new-password'}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3068] focus:border-transparent"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {erro && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erro}</p>
          )}
          {sucesso && (
            <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{sucesso}</p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-[#1a3068] hover:bg-[#142554] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {carregando && <Loader2 size={15} className="animate-spin" />}
            {aba === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>
      </div>
    </div>
  )
}
