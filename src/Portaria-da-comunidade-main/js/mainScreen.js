const conteudoPrincipal = document.querySelector('.conteudo-principal');
const conteudoEncomendas = document.querySelector('.conteudo-encomendas');
const filtroPedido = document.getElementById('filtroPedido');
const btnPesquisar = filtroPedido.nextElementSibling;

// Função para carregar e listar encomendas da API, com filtro opcional pelo número do pedido
async function carregarEncomendas(filtro = '') {
  try {
    const res = await fetch(`http://localhost:3000/api/encomendas/listarencomenda`, {
      method: 'GET',
      credentials: 'include' // ← ESSENCIAL para enviar o cookie JWT
    });

    if (!res.ok) throw new Error('Erro ao carregar encomendas');

    let encomendas = await res.json();

    if (filtro) {
      const filtroLower = filtro.toLowerCase();
      encomendas = encomendas.filter(e =>
        e.numero_pedido.toString().toLowerCase().includes(filtroLower)
      );
    }

    mostrarListaEncomendas(encomendas);
  } catch (err) {
    console.error(err);
    conteudoEncomendas.innerHTML = `<p style="color:red;">Falha ao carregar encomendas.</p>`;
  }
}


// Mostra a lista lateral de encomendas
function mostrarListaEncomendas(encomendas) {
  if (!encomendas.length) {
    conteudoEncomendas.innerHTML = '<p>Nenhuma encomenda encontrada.</p>';
    return;
  }

  conteudoEncomendas.innerHTML = '';
  encomendas.forEach(encomenda => {
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = `Pedido #${encomenda.numero_pedido} - ${encomenda.nome_aplicativo || encomenda.destinatario || 'Sem nome'}`;
    a.addEventListener('click', e => {
      e.preventDefault();
      mostrarDetalhesEncomenda(encomenda);
    });
    conteudoEncomendas.appendChild(a);
  });
}

// Exibe formulário para cadastrar nova encomenda
async function mostrarFormularioNovaEncomenda() {
  conteudoPrincipal.innerHTML = `
    <form id="formNovaEncomenda" class="form-encomenda">
      <h2>Nova Encomenda</h2>
      <label for="numero_pedido">Número do Pedido:</label>
      <input type="text" name="numero_pedido" id="numero_pedido" placeholder="Número do Pedido" required>
      <label for="nome_aplicativo">Nome do Aplicativo:</label>
      <input type="text" name="nome_aplicativo" id="nome_aplicativo" placeholder="Nome do Aplicativo" required>
      <label for="codigo_rastreio">Código de Rastreio:</label>
      <input type="text" name="codigo_rastreio" id="codigo_rastreio" placeholder="Código de Rastreio (opcional)">

      <label for="previsao_entrega">Previsão de Entrega:</label>
      <input type="text" name="previsao_entrega" id="previsao_entrega" placeholder="Previsão de Entrega (ex: 15/06)">
      
      <label for="descricao">Descrição:</label>
      <textarea name="descricao" id="descricao" placeholder="Descrição (opcional)"></textarea>

      <label for="estabelecimento_id">Estabelecimento:</label>
      <select name="estabelecimento_id" id="estabelecimento_id" required>
        <option value="">Carregando estabelecimentos...</option>
      </select>

      <label for="status">Status:</label>
      <select name="status" id="status" required>
        <option value="em processamento">Em Processamento</option>
        <option value="pronto para retirada">Pronto para Retirada</option>
        <option value="entregue ao usuario">Entregue ao Usuário</option>
      </select>

      <label for="perecivel">Perecível:</label>
      <label><input type="radio" name="perecivel" value="sim" required> Sim</label>
      <label><input type="radio" name="perecivel" value="não"> Não</label>

      <label for="produto_fragil">Produto Frágil:</label>
      <label><input type="radio" name="produto_fragil" value="sim" required> Sim</label>
      <label><input type="radio" name="produto_fragil" value="não"> Não</label>

      <button type="submit">Cadastrar</button>
    </form>
  `;

  // Carregar estabelecimentos para o select
  await carregarEstabelecimentos();

  // Adiciona evento submit para o formulário
  const form = document.getElementById('formNovaEncomenda');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    await cadastrarEncomenda();
  });
}

// Função para carregar estabelecimentos (ajuste a rota conforme sua API)
async function carregarEstabelecimentos() {
  const select = document.getElementById('estabelecimento_id');
  try {
    const res = await fetch(`http://localhost:3000/api/estabelecimentos`);
    if (!res.ok) throw new Error('Erro ao carregar estabelecimentos');
    const estabelecimentos = await res.json();

    if (estabelecimentos.length === 0) {
      select.innerHTML = '<option value="">Nenhum estabelecimento encontrado</option>';
      return;
    }

    select.innerHTML = '<option value="">Selecione um estabelecimento</option>';
    estabelecimentos.forEach(est => {
      const option = document.createElement('option');
      option.value = est.id;  // Usando o campo 'id' da tabela estabelecimento
      option.textContent = est.nome_estabelecimento; // Usando 'nome_estabelecimento' da tabela
      select.appendChild(option);
    });
  } catch (err) {
    console.error(err);
    select.innerHTML = '<option value="">Erro ao carregar estabelecimentos</option>';
  }
}

// Cadastrar encomenda enviando para API
async function cadastrarEncomenda() {
  const form = document.getElementById('formNovaEncomenda');

  // Pega os dados do formulário
  const dados = {
    numero_pedido: form.numero_pedido.value.trim(),
    nome_aplicativo: form.nome_aplicativo.value.trim(),
    codigo_rastreio: form.codigo_rastreio.value.trim(),
    perecivel: form.perecivel.value,
    produto_fragil: form.produto_fragil.value,
    previsao_entrega: form.previsao_entrega.value.trim(),
    descricao: form.descricao.value.trim(),
    estabelecimento_id: form.estabelecimento_id.value,
    status: form.status.value
  };

  // Validações básicas
  if (!dados.numero_pedido || !dados.nome_aplicativo || !dados.perecivel || !dados.produto_fragil || !dados.estabelecimento_id || !dados.status) {
    alert('Por favor, preencha todos os campos obrigatórios.');
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/encomendas/criarencomenda`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      credentials: 'include',
      body: JSON.stringify(dados)
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Status ${res.status}`);
    }
    
    alert('Encomenda cadastrada com sucesso!');
    filtroPedido.value = '';
    conteudoPrincipal.innerHTML = '';
    carregarEncomendas();
  
  } catch (err) {
    console.error('Erro na requisição:', err);
    alert(`Erro ao cadastrar encomenda: ${err.message}`);
  }
}

// Exibe detalhes da encomenda selecionada
function mostrarDetalhesEncomenda(encomenda) {
  conteudoPrincipal.innerHTML = `
    <div class="conteudo_detalhe">
    <h2>Detalhes do Pedido #${encomenda.numero_pedido}</h2>
    <p><strong>Nome do Aplicativo:</strong> ${encomenda.nome_aplicativo}</p>
    <p><strong>Código de Rastreio:</strong> ${encomenda.codigo_rastreio || 'Não informado'}</p>
    <p><strong>Perecível:</strong> ${encomenda.perecivel}</p>
    <p><strong>Produto Frágil:</strong> ${encomenda.produto_fragil}</p>
    <p><strong>Previsão de Entrega:</strong> ${encomenda.previsao_entrega || 'Não informado'}</p>
    <p><strong>Descrição:</strong> ${encomenda.descricao || 'Nenhuma'}</p>
    <p><strong>Estabelecimento:</strong> ${encomenda.nome_estabelecimento || encomenda.estabelecimento_id || 'Não informado'}</p>
    <p><strong>Status:</strong> ${encomenda.status}</p>
    <p><strong>Data de Cadastro:</strong> ${encomenda.data_cadastro}</p>
    <button id="botaoVoltar">Voltar</button>
    </div>
  `;

  document.getElementById('botaoVoltar').addEventListener('click', () => {
    conteudoPrincipal.innerHTML = '';
  });
}

// Event listeners para interação

// Botão "Nova+" abre formulário
document.getElementById('botaoAbrirModal').addEventListener('click', () => {
  mostrarFormularioNovaEncomenda();
});

// Botão lupa pesquisa encomendas
btnPesquisar.addEventListener('click', () => {
  carregarEncomendas(filtroPedido.value.trim());
});

// Pesquisa ao pressionar Enter no input filtro
filtroPedido.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    carregarEncomendas(filtroPedido.value.trim());
  }
});

// Carrega lista de encomendas ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
  carregarEncomendas();
});

