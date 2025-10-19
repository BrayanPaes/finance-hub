const pool = require('../database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { segredoJWT } = require('../config.js');
const usuarioSchema = require('../schemas/usuario.schema');
const { z } = require('zod');

// --- ROTA DE CADASTRO ---
const cadastrarUsuario = async (req, res) => {
    try{
    const dadosValidados = usuarioSchema.parse(req.body);
    const {nome, email, senha} = dadosValidados;

    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    const querySQL = 'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING *';
    const resultado = await pool.query(querySQL, [nome, email, senhaHash]);

    const usuarioCriado = resultado.rows[0];
    delete usuarioCriado.senha;
    res.status(201).json(usuarioCriado);

} catch (error) {
    if (error instanceof z.ZodError) {
        const simpleErrors = error.issues.map(issue => ({
            campo: issue.path[0],
            mensagem: issue.message
        }));

        return res.status(400).json({
            message: "Dados de entrada inválidos",
            errors: simpleErrors 
        });
    }

    console.error('Erro ao inserir usuário:', error);
    res.status(500).json({ message: "Erro interno do servidor" });
}
};

// --- ROTA DE LOGIN ---
const loginUsuario = async (req, res) =>{
    try{
    const {email, senha} = req.body;
    const querySQL = 'SELECT * FROM usuarios WHERE email = $1';
    const resultado = await pool.query(querySQL, [email]);

    if (resultado.rows.length === 0) {
        return res.status(404).json({ message: "Usuário não encontrado."});
    }

    const usuarioDoBanco = resultado.rows[0];

    if (await bcrypt.compare(senha, usuarioDoBanco.senha)) {        
        const payload = {id: usuarioDoBanco.id};
        const token = jwt.sign(
            payload,
            segredoJWT,
            {expiresIn: '1h'}
        );
        res.status(200).json({ message: "Login bem-sucedido!", token: token});
    } else {
        res.status(401).json({ message: "Senha incorreta." });
    }
    
    }catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({message: "Erro interno do servidor"});
    }
};

const obterPerfil = async (req, res) => {
    try{
        const querySQL = 'SELECT id, nome, email FROM usuarios WHERE id = $1';
        const resultado = await pool.query(querySQL, [req.user.id])
        res.status(200).json(resultado.rows[0]);
    }catch (error){
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({ message: "Erro interno do servidor"});
    }
};

module.exports = {
    cadastrarUsuario,
    loginUsuario,
    obterPerfil
};