document.addEventListener('DOMContentLoaded', () => {

    // --- VARIÁVEIS E REFERÊNCIAS ---
    const apiUrl = 'https://finance-hub-vkfz.onrender.com/api';
    const authView = document.getElementById('auth-view');
    const registroForm = document.getElementById('registro-form');
    const loginForm = document.getElementById('login-form');
    const authMensagem = document.getElementById('auth-mensagem');
    const appView = document.getElementById('app-view');
    const transacoesLista = document.getElementById('transacoes-lista');
    const loadingSpinner = document.getElementById('loading-spinner');

    // --- VARIÁVEIS DE ESTADO DA APLICAÇÃO ---
    let modoDeEdicao = false;
    let idParaEditar = null;

    // --- NOVAS REFERÊNCIAS PARA O FORMULÁRIO DE TRANSAÇÃO ---
    const transacaoForm = document.getElementById('transacao-form');
    const salvarBtn = document.getElementById('salvar-btn');
    const cancelarBtn = document.getElementById('cancelar-btn');

    const token = localStorage.getItem('authToken');
    if (token) {
        authView.classList.add('hidden');
        appView.classList.remove('hidden');
        inicializarApp();
    }

    // --- LÓGICA DE CADASTRO ---
    registroForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nome = document.getElementById('registro-nome').value;
        const email = document.getElementById('registro-email').value;
        const senha = document.getElementById('registro-senha').value;
        
        const dadosUsuario = { nome, email, senha };

        loadingSpinner.classList.remove('hidden');
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
                loadingSpinner.classList.add('hidden');
            } else {
                loadingSpinner.classList.add('hidden');
                if (data.errors && data.errors.length > 0) {
                    loadingSpinner.classList.add('hidden');
                    authMensagem.textContent = data.errors[0].mensagem;
                } else {
                    authMensagem.textContent = data.message || 'Erro ao cadastrar.';
                }
                authMensagem.style.color = 'red';
            }
        } catch (error) {
            loadingSpinner.classList.add('hidden');
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
        loadingSpinner.classList.remove('hidden');

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
                loadingSpinner.classList.add('hidden');

                inicializarApp();

            } else {
                loadingSpinner.classList.add('hidden');
                authMensagem.textContent = data.message || 'Erro ao fazer login.';
                authMensagem.style.color = 'red';
            }
        } catch (error) {
            loadingSpinner.classList.add('hidden');
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
            item.dataset.id = transacao.id;

                item.dataset.descricao = transacao.descricao;
                item.dataset.valor = transacao.valor;
                const dataUTC = new Date(transacao.data);
                const ano = dataUTC.getUTCFullYear();
                const mes = String(dataUTC.getUTCMonth() + 1).padStart(2, '0');
                const dia = String(dataUTC.getUTCDate()).padStart(2, '0');
                item.dataset.data = `${ano}-${mes}-${dia}`;
                item.dataset.categoria = transacao.categoria;
                item.dataset.tipo = transacao.tipo;
                
            const conteudo = document.createElement('div');
            conteudo.innerHTML = `
                    <div class="transacao-linha-1">
                        <strong>${transacao.descricao}</strong>
                        <small>(${transacao.categoria})</small>
                    </div>
                    <div class="transacao-linha-2">
                        <span style="color:${transacao.tipo === 'receita' ? 'green' : 'red'};">
                            R$ ${transacao.valor}
                        </span>
                        <small>(${dia}/${mes}/${ano})</small>
                    </div>
                `;

            const botoes = document.createElement('div');
            botoes.className = 'botoes-container';

            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.className = 'edit-btn';

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Deletar';
            deleteButton.className = 'delete-btn';

            botoes.appendChild(editButton);
            botoes.appendChild(deleteButton);

            item.appendChild(conteudo);
            item.appendChild(botoes);

            transacoesLista.appendChild(item);
            });
                
        } catch (error) {
            console.error('Erro ao buscar dados financeiros:', error);
        }
    }

    transacaoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const token = localStorage.getItem('authToken');
        if (!token) return alert('Sessão expirada. Faça o login novamente.');

        const dataString = document.getElementById('transacao-data').value;
        const dataCorrigida = new Date(dataString + 'T12:00:00');

        const dadosTransacao = {
            descricao: document.getElementById('transacao-descricao').value,
            valor: document.getElementById('transacao-valor').value,
            data: dataCorrigida,
            categoria: document.getElementById('transacao-categoria').value,
            tipo: document.getElementById('transacao-tipo').value,
        };

        let url = `${apiUrl}/transacoes`;
        let method = 'POST';
        if (modoDeEdicao) {
            url = `${apiUrl}/transacoes/${idParaEditar}`;
            method = 'PUT';
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dadosTransacao)
            });

            if (response.ok) {
                transacaoForm.reset(); 
                if (modoDeEdicao) {
                    modoDeEdicao = false;
                    idParaEditar = null;
                    salvarBtn.textContent = 'Adicionar';
                    cancelarBtn.classList.add('hidden');
                }
                buscarDadosFinanceiros();
            } else {
                const errorData = await response.json();
                alert(`Erro: ${errorData.message || 'Não foi possível salvar a transação.'}`);
            }
        } catch (error) {
            console.error('Erro ao salvar transação:', error);
            alert('Erro de conexão ao salvar transação.');
        }
    });

    transacoesLista.addEventListener('click', async (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const item = event.target.closest('li');
            const transacaoId = item.dataset.id;

            const token = localStorage.getItem('authToken');
            if(!token) {
                alert('Sessão expirada. Faça login novamente.');
                return;
            }
            if (!confirm('Tem certeza que deseja deletar esta transação?')) {
                return;
            }
            try {
                const response = await fetch(`${apiUrl}/transacoes/${transacaoId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    buscarDadosFinanceiros();
                } else {
                    const errorData = await response.json();
                    alert(`Erro ao deletar: ${errorData.message}`);
                }
            } catch (error) {
                console.error('Erro ao deletar transação:', error);
                alert('Erro de conexão ao deletar transação.');
            }
        }

        if (event.target.classList.contains('edit-btn')) {
            const item = event.target.closest('li');

            const id = item.dataset.id;
            const descricao = item.dataset.descricao;
            const valor = item.dataset.valor;
            const data = item.dataset.data;
            const categoria = item.dataset.categoria;
            const tipo = item.dataset.tipo;

            document.getElementById('transacao-descricao').value = descricao;
            document.getElementById('transacao-valor').value = valor;
            document.getElementById('transacao-data').value = data;
            document.getElementById('transacao-categoria').value = categoria;
            document.getElementById('transacao-tipo').value = tipo;

            modoDeEdicao = true;
            idParaEditar = id;
            salvarBtn.textContent = 'Salvar Alterações'; // Muda o texto do botão
            cancelarBtn.classList.remove('hidden');
        }
    });

    cancelarBtn.addEventListener('click', () => {
        transacaoForm.reset();
        modoDeEdicao = false;
        idParaEditar = null;
        salvarBtn.textContent = 'Adicionar';
        cancelarBtn.classList.add('hidden');
    });

    // --- LÓGICA DE LOGOUT ---
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        window.location.reload();
    });
});