const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');

router.get('/estabelecimentos', (req, res) => {
  const sql = 'SELECT id, nome_estabelecimento FROM estabelecimento';

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar estabelecimentos:', err.message);
      return res.status(500).json({ error: 'Erro ao buscar estabelecimentos' });
    }
    res.json(rows);
  });
});

router.post('/estabelecimentos', (req, res) => {
  const {
    nome,
    sobrenome,
    email,
    senha,
    nome_estabelecimento,
    cnpj,
    cep,
    rua,
    numero,
    bairro,
    cidade,
    estado
  } = req.body;

  // Valida campos obrigatórios
  if (!nome || !sobrenome || !email || !senha) {
    return res.status(400).json({ error: 'Campos obrigatórios: nome, sobrenome, email e senha.' });
  }

  const id = uuidv4();
  const hash = bcrypt.hashSync(senha, 10);

  const query = `
    INSERT INTO estabelecimento (
      id, nome, sobrenome, email, senha, nome_estabelecimento,
      cnpj, cep, rua, numero, bairro, cidade, estado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    id, nome, sobrenome, email, hash, nome_estabelecimento || null,
    cnpj || null, cep || null, rua || null, numero || null, bairro || null,
    cidade || null, estado || null
  ];

  db.run(query, params, function(err) {
    if (err) {
      console.error(err);
      if (err.message.includes('UNIQUE constraint failed: estabelecimento.email')) {
        return res.status(409).json({ error: 'Email já cadastrado.' });
      }
      return res.status(500).json({ error: 'Erro ao adicionar estabelecimento.' });
    }
    res.status(201).json({ message: 'Estabelecimento adicionado com sucesso!', id });
  });
});

router.delete('/estabelecimentos/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM estabelecimento WHERE id = ?';

  db.run(sql, [id], function(err) {
    if (err) {
      console.error('Erro ao deletar estabelecimento:', err.message);
      return res.status(500).json({ error: 'Erro ao deletar estabelecimento.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Estabelecimento não encontrado.' });
    }

    res.json({ message: 'Estabelecimento deletado com sucesso!' });
  });
});

module.exports = router;
