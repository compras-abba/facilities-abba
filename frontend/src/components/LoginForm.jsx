import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { login, getMe } from '../api';
import logoAbba from '../assets/logo-abba.png';

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await login(email, senha);
      const usuario = await getMe();
      onLogin(usuario);
    } catch (err) {
      setErro(err?.response?.data?.message || 'Email ou senha inválidos.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a3068]">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        {/* Logo ABBA */}
        <div className="flex flex-col items-center mb-6">
          <img src={logoAbba} alt="ABBA" className="h-16 object-contain mb-2" />
          <p className="text-sm text-gray-400 font-medium tracking-wider">Facilities</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
            <input
              type="email"
              autoComplete="email"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3068] focus:border-transparent"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Senha</label>
            <div className="relative">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="current-password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3068] focus:border-transparent"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                required
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
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-[#1a3068] hover:bg-[#142554] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {carregando && <Loader2 size={15} className="animate-spin" />}
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
