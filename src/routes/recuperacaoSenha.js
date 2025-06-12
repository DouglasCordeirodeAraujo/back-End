const express = require('express');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../database/db');
const { recuperarSenha } = require('../controllers/recuperacaoController');


function getUsuarioPorEmail(email) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT codigo_recuperacao, expiracao_codigo FROM usuario WHERE email = ?',
      [email],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
}

router.post('/verificar-codigo', async (req, res) => {
  const { email, codigo } = req.body;

  try {
    const usuario = await getUsuarioPorEmail(email);

    if (!usuario || usuario.codigo_recuperacao !== codigo) {
      return res.status(400).json({ ok: false, msg: 'Código inválido' });
    }

    const agora = new Date();
    const expiracao = new Date(usuario.expiracao_codigo);

    if (expiracao < agora) {
      return res.status(400).json({ ok: false, msg: 'Código expirado' });
    }

    // ✅ Código válido: envia o caminho da página de redefinição
    res.json({
      ok: true,
      msg: 'Código válido',
      redirecionar: '/html/resetpassword.html'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Erro interno ao verificar o código' });
  }
});


router.post('/redefinir-senha', async (req, res) => {
  const { email, codigo, senha } = req.body;

  
  if (!email || !codigo || !senha) {
    return res.status(400).json({ ok: false, msg: 'Dados incompletos' });
  }

  if (!validator.isEmail(email) || senha.length < 6) {
    return res.status(400).json({ ok: false, msg: 'Dados inválidos' });
  }

  try {
    const usuario = await getUsuarioPorEmail(email);

    if (!usuario) {
      return res.status(404).json({ ok: false, msg: 'Usuário não encontrado' });
    }

  
    if (usuario.codigo_recuperacao !== codigo) {
      return res.status(400).json({ ok: false, msg: 'Código inválido' });
    }

    const expiracao = new Date(usuario.expiracao_codigo);
    if (expiracao < new Date()) {
      return res.status(400).json({ ok: false, msg: 'Código expirado' });
    }

    const agoraISO = new Date().toISOString();
    const hash = await bcrypt.hash(senha, 10);

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE usuario
         SET senha = ?, codigo_recuperacao = NULL, expiracao_codigo = NULL,
         senha_atualizada_em = ?
         WHERE email = ?`,
        [hash, agoraISO, email],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ ok: true, msg: 'Senha redefinida com sucesso' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Erro interno ao redefinir a senha' });
  }
});

router.post('/recuperar-senha', recuperarSenha);

module.exports = router;