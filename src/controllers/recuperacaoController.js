const db = require('../database/db');
const enviarEmail = require('../utils/enviarEmail');
const gerarCodigo = require('../utils/gerarCodigo');

async function recuperarSenha(req, res) {
  const { email } = req.body;

  db.get('SELECT * FROM usuario WHERE email = ?', [email], async (err, usuario) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro interno');
    }

    if (!usuario) {
      return res.status(200).json({ 
      sucesso: true, 
      msg: 'Se o e-mail estiver cadastrado, enviaremos um código para recuperação.' 
    });
  }

    const codigo = gerarCodigo();
    const expiracao = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    db.run(
      'UPDATE usuario SET codigo_recuperacao = ?, expiracao_codigo = ? WHERE email = ?',
      [codigo, expiracao, email],
      async (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Erro ao salvar código no banco');
        }

        try {
          const URL_FRONT = process.env.URL_FRONT;
          await enviarEmail(email, codigo);
          res.status(200).json({
            sucesso: true,
            redirecionar: `${URL_FRONT}/html/checkcode.html?email=${email}`
          });
        } catch (erroEmail) {
          console.error(erroEmail);
          res.status(500).send('Erro ao enviar o e-mail');
        }
      }
    );
  });
}

module.exports = { recuperarSenha };