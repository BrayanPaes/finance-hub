const { Pool } = require('pg');

// --- CONFIGURAÇÃO DA CONEXÃO COM O POSTGRESQL (Supabase) ---
const pool = new Pool({
    user: 'postgres',
    host: 'db.moqbswkphogicikohhrf.supabase.co',
    database: 'postgres',
    password: 'Brayan090909',
    port: 5432
});
module.exports = pool;