const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_REMETENTE,
    pass: process.env.SENHA_APP_EMAIL
  }
});

async function enviarCodigo(destinatario, codigo) {
  const mailOptions = {
    from: process.env.EMAIL_REMETENTE,
    to: destinatario,
    subject: 'Código de Recuperação de Senha',
    html: `<p>Seu código de recuperação é: <strong>${codigo}</strong></p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Código enviado para ' + destinatario);
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err);
    throw err;
  }
}

module.exports = enviarCodigo;