const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'facilities-secret-2026';

function autenticar(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Não autenticado' });
  try {
    const token = header.split(' ')[1];
    req.usuario = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

function exigirPerfil(...perfis) {
  return (req, res, next) => {
    if (!perfis.includes(req.usuario?.perfil)) {
      return res.status(403).json({ error: 'Sem permissão para esta ação' });
    }
    next();
  };
}

module.exports = { autenticar, exigirPerfil };
