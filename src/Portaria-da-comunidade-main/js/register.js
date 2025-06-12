const inputDate = document.getElementById('dataNascimento');
if (inputDate) {
  const hoje = new Date();
  const ano = hoje.getFullYear() - 18;
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  inputDate.max = `${ano}-${mes}-${dia}`;
}


document.getElementById('formCadastro')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const dadosUsuario = {
    nome: e.target.nome.value,
    sobrenome: e.target.sobrenome.value,
    email: e.target.email.value,
    senha: e.target.senha.value,
    dataNascimento: e.target.dataNascimento.value,
  };

  try {
    const res = await fetch('http://localhost:3000/api/usuarios/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dadosUsuario)
    });

    const data = await res.json();
    if (!res.ok) return alert('Erro: ' + (data.error || 'Falha ao cadastrar.'));
    alert(`Usuário ${data.nome} cadastrado com sucesso!`);
    window.location.href = 'login.html';
  } catch (err) {
    alert('Erro na comunicação com o servidor.');
    console.error(err);
  }
});
