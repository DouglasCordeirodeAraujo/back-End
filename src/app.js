const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const userRoutes = require('./routes/userRoutes');
const encomendasRoutes = require('./routes/encomendas');
const recuperacaoSenhaRoutes = require('./routes/recuperacaoSenha');
const estabelecimentosRouter = require('./routes/estabelecimentos');

const app = express();

app.use(helmet());

const whitelist = [
  'http://127.0.0.1:5501',
  'http://localhost:5501',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://127.0.0.1:3000',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    
    if (!origin) return callback(null, true);

    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS não permitido pelo backend: ' + origin));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

app.use(cookieParser());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use(bodyParser.json());

app.use('/api/usuarios', userRoutes);
app.use('/', recuperacaoSenhaRoutes);
app.use('/api/encomendas', encomendasRoutes);
app.use('/api', estabelecimentosRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.message.startsWith('CORS')) {
    return res.status(403).json({ error: err.message });
  }
  res.status(500).json({ error: 'Erro interno do servidor' });
});

module.exports = app;