const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

const runAsync = (sql, params=[]) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });

exports.criarEncomenda = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const {
      numero_pedido,
      nome_aplicativo,
      codigo_rastreio,
      perecivel,
      produto_fragil,
      previsao_entrega,
      descricao,
      status = 'em processamento',
      estabelecimento_id
    } = req.body;

    const data_cadastro = new Date().toISOString();

    // Validação básica
    if (!numero_pedido || !nome_aplicativo || !estabelecimento_id) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    const id = uuidv4();

    await runAsync(`
      INSERT INTO encomenda (
        id ,numero_pedido, nome_aplicativo, codigo_rastreio, perecivel,
        produto_fragil, previsao_entrega, descricao, status,
        data_cadastro, usuario_id, estabelecimento_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      numero_pedido,
      nome_aplicativo,
      codigo_rastreio,
      perecivel,
      produto_fragil,
      previsao_entrega,
      descricao,
      status,
      data_cadastro,
      usuario_id,
      estabelecimento_id
    ]);

    res.status(201).json({ message: 'Encomenda cadastrada com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cadastrar encomenda.' });
  }
};

exports.listarEncomendas = (req, res) => {
  const usuarioId = req.usuario.id;

  db.all('SELECT * FROM encomenda WHERE usuario_id = ?', [usuarioId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar encomendas.' });
    res.json(rows);
  });
};