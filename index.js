// --- IMPORTAÇÕES ---
const express = require('express');
const usuarioRoutes = require('./src/routes/usuario.routes.js');
const transacaoRoutes = require('./src/routes/transacoes.routes.js');

// --- CRIAÇÃO E CONFIGURAÇÃO APLICAÇÃO ---
const app = express();
const PORT = 3000;
app.use(express.json());

//--- ROTAS DA API ---
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/transacoes', transacaoRoutes); 

//--- INICIANDO O SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});