const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('../database/db');

module.exports = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Token ausente.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ error: 'Token inválido.' });

    db.get(
      'SELECT senha_atualizada_em FROM usuario WHERE id = ?',
      [payload.sub],
      (err, row) => {
        if (err) {
          console.error('Erro DB:', err);
          return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
        if (!row) return res.status(401).json({ error: 'Usuário não encontrado.' });

        const pwdChanged = row.senha_atualizada_em ? new Date(row.senha_atualizada_em) : new Date(0);
        const tokenIssued = new Date(payload.iat * 1000);

        if (pwdChanged > tokenIssued) {
          return res.status(401).json({ error: 'Senha alterada – faça login novamente.' });
        }

        req.usuario = { id: payload.sub };
        return next();
      }
    );
  });
};
