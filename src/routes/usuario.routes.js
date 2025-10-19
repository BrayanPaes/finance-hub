const { Router } = require('express');
const usuarioController = require('../controllers/usuario.controller.js');
const verificaToken = require('../middlewares/auth.middleware.js');

const router = Router();

//Rotas públicas
router.post('/', usuarioController.cadastrarUsuario);
router.post('/login', usuarioController.loginUsuario);

//Rotas protegidas
router.get('/perfil', verificaToken, usuarioController.obterPerfil);

module.exports = router;