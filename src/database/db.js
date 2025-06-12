const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return console.error('Erro  ao conectar ao SQLite', err.message);
    console.log('Conectado ao banco de dados SQLite');
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS usuario (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        sobrenome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        data_nascimento TEXT NOT NULL,
        cpf TEXT,
        cep TEXT,
        rua TEXT,
        numero TEXT,
        bairro TEXT,
        cidade TEXT,
        estado TEXT,
        celular TEXT,
        criado_em TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`ALTER TABLE usuario ADD COLUMN codigo_recuperacao TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Erro ao adicionar codigo_recuperacao:', err.message);
        }
    });

    db.run(`ALTER TABLE usuario ADD COLUMN expiracao_codigo TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Erro ao adicionar expiracao_codigo:', err.message);
        }
    });
    db.run(`ALTER TABLE usuario ADD COLUMN senha_atualizada_em TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Erro ao adicionar senha_atualizada_em:', err.message);
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS estabelecimento (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        sobrenome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        nome_estabelecimento TEXT,
        cnpj TEXT,
        cep TEXT,
        rua TEXT,
        numero TEXT,
        bairro TEXT,
        cidade TEXT,
        estado TEXT,
        criado_em TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS encomenda (
        id TEXT PRIMARY KEY,
        numero_pedido TEXT NOT NULL,
        nome_aplicativo TEXT NOT NULL,
        codigo_rastreio TEXT,
        perecivel TEXT CHECK(perecivel IN ('sim', 'não')) DEFAULT 'não',
        produto_fragil TEXT CHECK(produto_fragil IN ('sim', 'não')) DEFAULT 'não',
        previsao_entrega TEXT,
        descricao TEXT,
        status TEXT CHECK(status IN ('em processamento', 'pronto para retirada', 'entregue ao usuario final')) DEFAULT 'em processamento',
        data_cadastro TEXT DEFAULT CURRENT_TIMESTAMP,

        usuario_id TEXT NOT NULL,
        estabelecimento_id TEXT NOT NULL,

        FOREIGN KEY (usuario_id) REFERENCES usuario(id),
        FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimento(id)
        )
    `);

});

module.exports = db;