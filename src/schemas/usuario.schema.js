const { z } = require('zod');

// --- DEFINIÇÃO DO SCHEMA DE VALIDAÇÃO PARA O USUÁRIO ---
const usuarioSchema = z.object({
    nome: z.string().nonempty({message: "O nome é obrigatório."}),
    email: z.string().email({message: "Por favor, insira um email válido." }),
    senha: z.string().min(8, {message: "Sua senha deve conter no minimo 8 caracteres."})
});
module.exports = usuarioSchema;