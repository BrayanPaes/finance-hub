const pool = require('../database/db.js');

// --- ROTA PARA CRIAR UMA NOVA TRANSAÇÃO (PROTEGIDA) ---
const criarTransacao = async (req, res) => {
    try {
        const {descricao, valor, data, categoria, tipo } = req.body;
        const usuarioId = req.user.id;
        const querySQL = 'INSERT INTO transacoes (descricao, valor, data, categoria, tipo, usuario_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
        const valores = [descricao, valor, data, categoria, tipo, usuarioId];
        const resultado = await pool.query(querySQL, valores);

        res.status(201).json(resultado.rows[0]);
    } catch (error){
        console.error('Erro ao criar transação:', error);
        res.status(500).json({message: "Erro interno do servidor."});
    }
};

const listarTransacoes = async(req, res) => {
    try {
        const usuarioId = req.user.id;
        const querySQL = 'SELECT * FROM transacoes WHERE usuario_id = $1';
        const resultado = await pool.query(querySQL, [usuarioId]);

        res.status(200).json(resultado.rows);
    } catch (error){
        console.error('Erro ao listar transações:', error);
        res.status(500).json({message: "Erro interno do servidor."});
    }
};

const atualizarTransacao = async(req, res) => {
    try{
        const { id } = req.params;
        const { descricao, valor, data, categoria, tipo } = req.body;
        const usuarioId = req.user.id;

        const querySQL = 'UPDATE transacoes SET descricao = $1, valor = $2, data = $3,categoria = $4, tipo = $5 WHERE id = $6 AND usuario_id = $7 RETURNING *';
        const valores = [descricao, valor, data, categoria, tipo, id, usuarioId];
        const resultado = await pool.query(querySQL, valores);

        if (resultado.rows.length === 0) {
            return res.status(404).json({message: 'Transação não encontrada ou não pertence ao usuário.'});
        }

        res.status(200).json(resultado.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar transação:', error);
        res.status(500).json({message: "Erro interno do servidor."});
    }
};

const deletarTransacao = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.user.id;

        const querySQL = 'DELETE FROM transacoes WHERE id = $1 AND usuario_id = $2 RETURNING *';
        
        const valores = [id, usuarioId];
        const resultado = await pool.query(querySQL, valores);

        if (resultado.rows.length === 0) {
            return res.status(404).json({message: 'Transação não encontrada ou não pertence ao usuário.'});
        }

        res.sendStatus(204);
    } catch (error) {
        console.error('Erro ao deletar transação:', error);
        res.status(500).json({message: "Erro interno do servidor."});
    }
};

// --- ROTA PARA OBTER O EXTRATO/RESUMO FINANCEIRO (PROTEGIDA) ---
// --- ROTA PARA OBTER O EXTRATO/RESUMO FINANCEIRO (PROTEGIDA) ---

const obterExtrato = async (req, res) => {
    try {
        const usuarioId = req.user.id;

        const queryReceitas = 'SELECT SUM(valor) AS total FROM transacoes WHERE tipo = \'receita\' AND usuario_id = $1';
        const resultadoReceitas = await pool.query(queryReceitas, [usuarioId]);

        const queryDespesas = 'SELECT SUM(valor) AS total FROM transacoes WHERE tipo = \'despesas\' AND usuario_id = $1';
        const resultadoDespesas = await pool.query(queryDespesas, [usuarioId]);

        const totalReceitas = resultadoReceitas.rows[0].total || 0;
        const totalDespesas = resultadoDespesas.rows[0].total || 0;

        const saldo = parseFloat(totalReceitas) - parseFloat(totalDespesas);

        res.status(200).json({
            receitas: totalReceitas,
            despesas: totalDespesas,
            saldo: saldo
        });

    } catch (error) {
        console.error('Erro ao obter extrato:', error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
};

module.exports = {
    criarTransacao,
    listarTransacoes,
    atualizarTransacao,
    deletarTransacao,
    obterExtrato
};