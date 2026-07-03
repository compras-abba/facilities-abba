const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../lib/supabase');
const { autenticar, exigirPerfil } = require('../middleware/auth');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'facilities-secret-2026';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const { data: usuario } = await supabase
      .from('usuarios_facilities')
      .select('*')
      .eq('email', email)
      .single();

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const { id, nome, perfil } = usuario;
    const token = jwt.sign({ id, nome, email: usuario.email, perfil }, SECRET, { expiresIn: '8h' });

    res.json({
      token,
      usuario: { id, nome, email: usuario.email, perfil },
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno ao fazer login' });
  }
});

// GET /api/auth/me
router.get('/me', autenticar, async (req, res) => {
  try {
    const { data: usuario } = await supabase
      .from('usuarios_facilities')
      .select('id, nome, email, perfil, ativo, created_at')
      .eq('id', req.usuario.id)
      .single();

    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(usuario);
  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/auth/usuarios
router.post('/usuarios', autenticar, exigirPerfil('Admin'), async (req, res) => {
  try {
    const { nome, email, senha, perfil } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Campos obrigatórios: nome, email, senha' });
    }

    const senha_hash = await bcrypt.hash(senha, 10);
    const { data: usuario, error } = await supabase
      .from('usuarios_facilities')
      .insert({ nome, email, senha_hash, perfil: perfil || 'Solicitante' })
      .select('id, nome, email, perfil, ativo, created_at')
      .single();

    if (error?.code === '23505') {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }
    if (error) throw error;

    res.status(201).json(usuario);
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    res.status(500).json({ error: 'Erro interno ao criar usuário' });
  }
});

// GET /api/auth/usuarios
router.get('/usuarios', autenticar, exigirPerfil('Admin'), async (req, res) => {
  try {
    const { data: usuarios, error } = await supabase
      .from('usuarios_facilities')
      .select('id, nome, email, perfil, ativo, created_at, updated_at')
      .order('nome');

    if (error) throw error;
    res.json(usuarios);
  } catch (err) {
    console.error('Erro ao listar usuários:', err);
    res.status(500).json({ error: 'Erro interno ao listar usuários' });
  }
});

// PATCH /api/auth/usuarios/:id
router.patch('/usuarios/:id', autenticar, exigirPerfil('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, perfil, ativo } = req.body;

    const updateData = {};
    if (nome !== undefined) updateData.nome = nome;
    if (perfil !== undefined) updateData.perfil = perfil;
    if (ativo !== undefined) updateData.ativo = ativo;

    const { data: atualizado, error } = await supabase
      .from('usuarios_facilities')
      .update(updateData)
      .eq('id', id)
      .select('id, nome, email, perfil, ativo, updated_at')
      .single();

    if (error) throw error;
    if (!atualizado) return res.status(404).json({ error: 'Usuário não encontrado' });

    res.json(atualizado);
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    res.status(500).json({ error: 'Erro interno ao atualizar usuário' });
  }
});

// DELETE /api/auth/usuarios/:id
router.delete('/usuarios/:id', autenticar, exigirPerfil('Admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const { data: atualizado, error } = await supabase
      .from('usuarios_facilities')
      .update({ ativo: false })
      .eq('id', id)
      .select('id, nome, email, ativo')
      .single();

    if (error) throw error;
    if (!atualizado) return res.status(404).json({ error: 'Usuário não encontrado' });

    res.json({ message: 'Usuário desativado com sucesso', usuario: atualizado });
  } catch (err) {
    console.error('Erro ao desativar usuário:', err);
    res.status(500).json({ error: 'Erro interno ao desativar usuário' });
  }
});

module.exports = router;
