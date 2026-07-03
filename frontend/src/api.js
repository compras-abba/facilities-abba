import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Interceptor: adiciona token em todo request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('facilities_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export async function login(email, senha) {
  const { data } = await api.post('/auth/login', { email, senha });
  if (data.token) {
    localStorage.setItem('facilities_token', data.token);
  }
  return data;
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data;
}

export function logout() {
  localStorage.removeItem('facilities_token');
}

export async function listarUsuarios() {
  const { data } = await api.get('/auth/usuarios');
  return data;
}

export async function criarUsuario(dados) {
  const { data } = await api.post('/auth/usuarios', dados);
  return data;
}

export async function atualizarUsuario(id, dados) {
  const { data } = await api.patch(`/auth/usuarios/${id}`, dados);
  return data;
}

// Solicitações
export async function listarSolicitacoes(filtros = {}) {
  const { data } = await api.get('/solicitacoes', { params: filtros });
  return data;
}

export async function criarSolicitacao(dados) {
  const { data } = await api.post('/solicitacoes', dados);
  return data;
}

export async function atualizarSolicitacao(id, dados) {
  const { data } = await api.patch(`/solicitacoes/${id}`, dados);
  return data;
}

export async function deletarSolicitacao(id) {
  const { data } = await api.delete(`/solicitacoes/${id}`);
  return data;
}
