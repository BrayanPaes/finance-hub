const jwt = require('jsonwebtoken');

// --- SENHA SECRETA PARA USUARIOS  ---
const { segredoJWT } = require('../config.js');

// ---  MIDDLEWARE ---
// É uma "ferramenta" que vamos usar nas rotas que vêm abaixo.

function verificaToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1] //Pega só o token
    if (token == null) {
        return res.sendStatus(401);
    }
    jwt.verify(token, segredoJWT, (err, usuario) => {
        if (err) {
            return res.sendStatus(403);
        }
         req.user = usuario;
        next();
    });
}
module.exports = verificaToken;