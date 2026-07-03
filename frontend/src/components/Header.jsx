import React, { useState } from 'react';
import { Plus, LogOut, Users } from 'lucide-react';
import GestaoUsuarios from './GestaoUsuarios';
import logoAbba from '../assets/logo-abba.png';

const PERFIL_BADGE = {
  Admin:       'bg-purple-100 text-purple-800',
  Responsavel: 'bg-blue-100 text-blue-800',
  Solicitante: 'bg-green-100 text-green-800',
};

const PERFIL_LABELS = {
  Admin:       'Admin',
  Responsavel: 'Responsável',
  Solicitante: 'Solicitante',
};

export default function Header({ usuario, onLogout, onNova }) {
  const [gestaoAberta, setGestaoAberta] = useState(false);

  const inicial = usuario?.nome ? usuario.nome.charAt(0).toUpperCase() : '?';
  const perfil = usuario?.perfil;

  return (
    <>
      <header className="bg-[#1a3068] text-white px-6 py-3 flex items-center justify-between shadow-lg shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-lg px-2 py-1">
            <img src={logoAbba} alt="ABBA" className="h-7 object-contain" />
          </div>
          <p className="text-blue-300 text-xs font-medium tracking-wider">Facilities</p>
        </div>

        {/* Direita */}
        <div className="flex items-center gap-3">
          {/* Botão Nova Solicitação — só para Admin e Responsavel */}
          {(perfil === 'Admin' || perfil === 'Responsavel') && onNova && (
            <button
              onClick={onNova}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
            >
              <Plus size={16} />
              Nova Solicitação
            </button>
          )}

          {/* Ícone de gestão de usuários — só Admin */}
          {perfil === 'Admin' && (
            <button
              onClick={() => setGestaoAberta(true)}
              title="Gestão de Usuários"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-blue-200 hover:text-white"
            >
              <Users size={20} />
            </button>
          )}

          {/* Avatar + nome + perfil */}
          {usuario && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center font-bold text-sm text-white shrink-0">
                {inicial}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-tight">{usuario.nome}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${PERFIL_BADGE[perfil] || 'bg-gray-100 text-gray-700'}`}>
                  {PERFIL_LABELS[perfil] || perfil}
                </span>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={onLogout}
            title="Sair"
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-blue-200 hover:text-white"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {gestaoAberta && (
        <GestaoUsuarios onFechar={() => setGestaoAberta(false)} />
      )}
    </>
  );
}
