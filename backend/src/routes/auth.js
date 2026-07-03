const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { autenticar, exigirPerfil } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || 'facilities-secret-2026';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });
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
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      select: { id: true, nome: true, email: true, perfil: true, ativo: true, created_at: true },
    });
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

    const existente = await prisma.usuario.findUnique({ where: { email } });
    if (existente) {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }

    const senha_hash = await bcrypt.hash(senha, 10);
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha_hash,
        perfil: perfil || 'Solicitante',
      },
      select: { id: true, nome: true, email: true, perfil: true, ativo: true, created_at: true },
    });

    res.status(201).json(usuario);
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    res.status(500).json({ error: 'Erro interno ao criar usuário' });
  }
});

// GET /api/auth/usuarios
router.get('/usuarios', autenticar, exigirPerfil('Admin'), async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nome: true, email: true, perfil: true, ativo: true, created_at: true, updated_at: true },
      orderBy: { nome: 'asc' },
    });
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

    const atualizado = await prisma.usuario.update({
      where: { id },
      data: {
        ...(nome !== undefined && { nome }),
        ...(perfil !== undefined && { perfil }),
        ...(ativo !== undefined && { ativo }),
      },
      select: { id: true, nome: true, email: true, perfil: true, ativo: true, updated_at: true },
    });

    res.json(atualizado);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    console.error('Erro ao atualizar usuário:', err);
    res.status(500).json({ error: 'Erro interno ao atualizar usuário' });
  }
});

// DELETE /api/auth/usuarios/:id
router.delete('/usuarios/:id', autenticar, exigirPerfil('Admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const atualizado = await prisma.usuario.update({
      where: { id },
      data: { ativo: false },
      select: { id: true, nome: true, email: true, ativo: true },
    });

    res.json({ message: 'Usuário desativado com sucesso', usuario: atualizado });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    console.error('Erro ao desativar usuário:', err);
    res.status(500).json({ error: 'Erro interno ao desativar usuário' });
  }
});

module.exports = router;
