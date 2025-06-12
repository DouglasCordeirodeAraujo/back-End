const email = sessionStorage.getItem('emailRecuperacao');
const codigo = sessionStorage.getItem('codigoRecuperacao');

if (!email || !codigo) {
  alert('Fluxo inválido. Comece novamente.');
  window.location.href = 'forgotPassword.html';
}

document.getElementById('resetForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const senha = document.getElementById('senha').value;
  const confirmar = document.getElementById('confirmar').value;
  const msg = document.getElementById('msg');

  msg.innerText = ''; // limpa mensagem antes de qualquer verificação

  if (senha !== confirmar) {
    msg.innerText = 'As senhas não coincidem';
    setTimeout(() => { msg.innerText = ''; }, 5000); // limpa após 5s
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/redefinir-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, codigo, senha })
    });

    const data = await res.json();

    if (data.ok) {
      alert('Senha alterada com sucesso!');
      sessionStorage.clear();
      window.location.href = 'login.html';
    } else {
      msg.innerText = data.msg || 'Erro ao redefinir.';
      setTimeout(() => { msg.innerText = ''; }, 5000); // limpa erro do servidor
    }
  } catch (err) {
    msg.innerText = 'Falha de comunicação com o servidor.';
    setTimeout(() => { msg.innerText = ''; }, 5000);
  }
});