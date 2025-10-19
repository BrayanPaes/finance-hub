const { Router } = require('express');
const transacaoController = require('../controllers/transacao.controller.js');
const verificaToken = require('../middlewares/auth.middleware.js');

const router = Router();

router.use(verificaToken);

// C - Create
router.post('/', transacaoController.criarTransacao);

// R - Read (List)
router.get('/', transacaoController.listarTransacoes);

// R Read (Summary)
router.get('/extrato', transacaoController.obterExtrato);

// U - Update
router.put('/:id', transacaoController.atualizarTransacao);

// D - Delete
router.delete('/:id', transacaoController.deletarTransacao);

module.exports = router;
