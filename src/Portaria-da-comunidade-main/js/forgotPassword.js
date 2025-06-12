document.getElementById('formPassword')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  
  try {
    const res = await fetch('http://localhost:3000/recuperar-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    if (data.sucesso) {
      if (data.redirecionar) {
        window.location.href = data.redirecionar;
      } else {
        alert(data.msg || 'Se o e-mail estiver cadastrado, enviaremos um código.');
      }
    } else {
      alert('Erro ao enviar código');
    }
  } catch (err) {
    alert('Erro na comunicação com o servidor');
    console.error(err);
  }
});