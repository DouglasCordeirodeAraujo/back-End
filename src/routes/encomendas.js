const express = require('express');
const router = express.Router();
const encomendasController = require('../controllers/encomendasController');
const auth = require('../middlewares/auth');

router.get('/listarencomenda', auth, encomendasController.listarEncomendas);
router.post('/criarencomenda', auth, encomendasController.criarEncomenda);

module.exports = router;
