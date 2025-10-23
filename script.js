document.addEventListener('DOMContentLoaded', () => {

    // --- VARIÁVEIS E REFERÊNCIAS ---
    const apiUrl = 'https://finance-hub-vkfz.onrender.com/api';
    const authView = document.getElementById('auth-view');
    const registroForm = document.getElementById('registro-form');
    const loginForm = document.getElementById('login-form');
    const authMensagem = document.getElementById('auth-mensagem');
    const appView = document.getElementById('app-view');

    // --- LÓGICA DE CADASTRO ---
    registroForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nome = document.getElementById('registro-nome').value;
        const email = document.getElementById('registro-email').value;
        const senha = document.getElementById('registro-senha').value;
        
        const dadosUsuario = { nome, email, senha };

        try {
            // URL corrigida para a sintaxe correta
            const response = await fetch(`${apiUrl}/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosUsuario)
            });

            const data = await response.json();

            if (response.ok) {
                authMensagem.textContent = 'Cadastro realizado com sucesso! Você já pode fazer o login.';
                authMensagem.style.color = 'green';
                registroForm.reset();
            } else {
                if (data.errors && data.errors.length > 0) {
                    authMensagem.textContent = data.errors[0].mensagem;
                } else {
                    authMensagem.textContent = data.message || 'Erro ao cadastrar.';
                }
                authMensagem.style.color = 'red';
            }
        } catch (error) {
            authMensagem.textContent = 'Erro de conexão. Tente novamente.';
            authMensagem.style.color = 'red';
        }
    });


    // --- LÓGICA DE LOGIN (AGORA DENTRO DO DOMContentLoaded) ---
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;

        const dadosLogin = { email, senha };

        try {
            const response = await fetch(`${apiUrl}/usuarios/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosLogin)
            });

            const data = await response.json();

            if (response.ok) {
                const token = data.token;
                localStorage.setItem('authToken', token);

                authView.classList.add('hidden');
                appView.classList.remove('hidden');

            } else {
                authMensagem.textContent = data.message || 'Erro ao fazer login.';
                authMensagem.style.color = 'red';
            }
        } catch (error) {
            authMensagem.textContent = 'Erro de conexão. Tente novamente.';
            authMensagem.style.color = 'red';
        }
    });

});