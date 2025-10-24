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

                inicializarApp();

            } else {
                authMensagem.textContent = data.message || 'Erro ao fazer login.';
                authMensagem.style.color = 'red';
            }
        } catch (error) {
            authMensagem.textContent = 'Erro de conexão. Tente novamente.';
            authMensagem.style.color = 'red';
        }
    });


    // --- FUNÇÃO PRINCIPAL DA APLICAÇÃO ---
    async function inicializarApp() {
        const token = localStorage.getItem('authToken');

        if (!token) {
            console.error('Token não encontrado!');
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/usuarios/perfil`,{
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Falha ao buscar dados do perfil.');
            }
            const dadosUsuario = await response.json();

            const welcomeMessage = document.getElementById('welcome-message');
            welcomeMessage.textContent = `Olá, ${dadosUsuario.nome}!`;

            buscarDadosFinanceiros();

        } catch (error) {
            console.error('Erro ao inicializar a aplicação:', error);
        }
    }

    async function buscarDadosFinanceiros() {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            const resExtrato = await fetch(`${apiUrl}/transacoes/extrato`, {
                headers: {'Authorization': `Bearer ${token}`}
            });
            if (!resExtrato.ok) throw new Error('Erro ao buscar extrato.');
            const extrato = await resExtrato.json();

            const extratoContainer = document.getElementById('extrato-container');
            extratoContainer.innerHTML = `<div>
            <h4>Receitas</h4>
            <p style="color: green;">R$ ${extrato.receitas}</p>
            </div>
            <div>
            <h4>Despesas</h4>
            <p style="color: red;">R$ ${extrato.despesas}</p>
            </div>
            <div>
            <h4>Saldo</h4>
            <p style="Font-weight: bold;">R$ ${extrato.saldo}</p>
            </div>`;

            const resTransacoes = await fetch(`${apiUrl}/transacoes`,{
                headers: {'Authorization': `Bearer ${token}`}
            });
            if (!resTransacoes.ok) throw new Error('Erro ao buscar transações.');
            const transacoes = await resTransacoes.json();

            const transacoesLista = document.getElementById('transacoes-lista');
            transacoesLista.innerHTML = '';
            transacoes.forEach(transacao => {
            const item = document.createElement('li');
            item.innerHTML = `<strong>${transacao.descricao}</strong> <span style="color:${transacao.tipo === 'receita' ? 'green' : 'red'};">
            R$ ${transacao.valor}
            </span>
            <small>(${new Date(transacao.data).toLocaleDateString()})</small>`;
            transacoesLista.appendChild(item);
            });
                
        } catch (error) {
            console.error('Erro ao buscar dados financeiros:', error);
        }
    }

    const transacaoForm = document.getElementById('transacao-form');
    transacaoForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const descricao = document.getElementById('transacao-descricao').value;
        const valor = document.getElementById('transacao-valor').value;
        const data = document.getElementById('transacao-data').value;
        const categoria = document.getElementById('transacao-categoria').value;
        const tipo = document.getElementById('transacao-tipo').value;

        const token = localStorage.getItem('authToken');
        if (!token) {
            authMensagem.textContent = 'Sessão expirada. Faça o login novamente.';
            return;
        }
        const dadosTransacao = {descricao, valor, data, categoria, tipo};

        try {
            const response = await fetch(`${apiUrl}/transacoes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dadosTransacao)
            });

            if (response.ok) {
                transacaoForm.reset();
                buscarDadosFinanceiros();
            } else {
                const errorData = await response.json();
                alert(`Erro: ${errorData.message || 'Não foi possível adicionar a transação.'}`);
            }
        } catch (error) {
            console.error('Erro ao criar transação:', error);
            alert('Erro de conexão ao adicionar transação.');
        }
    });

    // --- LÓGICA DE LOGOUT ---
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('aturhToken');
        window.location.reload();
    });
});