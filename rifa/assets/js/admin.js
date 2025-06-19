// assets/js/admin.js

document.addEventListener('DOMContentLoaded', function() {

    // =========================================================================
    // INÍCIO - BLOCO DE CATEGORIAS
    // =========================================================================

    let categoriaModal = null;
    let confirmDeleteCategoriaModal = null;
    const categoriaModalElement = document.getElementById('categoriaModal');
    const confirmDeleteCategoriaModalElement = document.getElementById('confirmDeleteCategoriaModal');

    // Inicialize os modais APENAS se os elementos existirem
    if (categoriaModalElement) {
        categoriaModal = new bootstrap.Modal(categoriaModalElement);
    }
    if (confirmDeleteCategoriaModalElement) {
        confirmDeleteCategoriaModal = new bootstrap.Modal(confirmDeleteCategoriaModalElement);
    }

    // --- Variáveis de elementos DOM (Categorias) ---
    const addCategoriaBtn = document.getElementById('addCategoriaBtn');
    const categoriaForm = document.getElementById('categoriaForm');
    const categoriaIdInput = document.getElementById('categoriaId');
    const categoriaNomeInput = document.getElementById('categoriaNome');
    const saveCategoriaBtn = document.getElementById('saveCategoriaBtn');
    const categoriasTableBody = document.querySelector('#categoriasTable tbody');
    const categoriaNomeExcluir = document.getElementById('categoriaNomeExcluir');
    const confirmDeleteCategoriaBtn = document.getElementById('confirmDeleteCategoriaBtn');

    let categoriaToDeleteId = null;

    // --- Funções (Categorias) ---

    async function loadCategorias() {
        try {
            const response = await fetch('api/admin.php?action=get_categorias');
            const result = await response.json();

            if (result.success) {
                categoriasTableBody.innerHTML = '';
                if (result.data.length === 0) {
                    categoriasTableBody.innerHTML = '<tr><td colspan="3" class="text-center">Nenhuma categoria cadastrada.</td></tr>';
                    return;
                }
                result.data.forEach(categoria => {
                    const row = `
                        <tr data-id="${categoria.id}" data-nome="${categoria.nome}">
                            <td>${categoria.id}</td>
                            <td>${categoria.nome}</td>
                            <td>
                                <button type="button" class="btn btn-sm btn-info me-2 edit-btn">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-danger delete-btn">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                    categoriasTableBody.innerHTML += row;
                });
            } else {
                categoriasTableBody.innerHTML = `<tr><td colspan="3" class="text-center text-danger">Erro ao carregar categorias: ${result.message}</td></tr>`;
            }
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            categoriasTableBody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Erro de comunicação com a API ao carregar categorias.</td></tr>';
        }
    }

    // --- Listeners de Eventos (Categorias) ---
    if (addCategoriaBtn) {
        addCategoriaBtn.addEventListener('click', () => {
            categoriaIdInput.value = '';
            categoriaNomeInput.value = '';
            document.getElementById('categoriaModalLabel').innerText = 'Adicionar Nova Categoria';
            saveCategoriaBtn.innerText = 'Salvar Categoria';
            if (categoriaModal) categoriaModal.show();
        });
    }

    if (categoriaForm) {
        categoriaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = categoriaIdInput.value;
            const nome = categoriaNomeInput.value;
            const action = id ? 'update_categoria' : 'add_categoria';

            try {
                const response = await fetch('api/admin.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: id, nome: nome, action: action })
                });
                const result = await response.json();

                if (result.success) {
                    alert(result.message);
                    if (categoriaModal) categoriaModal.hide();
                    loadCategorias();
                } else {
                    alert('Erro: ' + result.message);
                }
            } catch (error) {
                console.error('Erro na requisição:', error);
                alert('Ocorreu um erro de comunicação.');
            }
        });
    }

    if (categoriasTableBody) {
        categoriasTableBody.addEventListener('click', (e) => {
            if (e.target.closest('.edit-btn')) {
                const row = e.target.closest('tr');
                categoriaIdInput.value = row.dataset.id;
                categoriaNomeInput.value = row.dataset.nome;
                document.getElementById('categoriaModalLabel').innerText = 'Editar Categoria';
                saveCategoriaBtn.innerText = 'Atualizar Categoria';
                if (categoriaModal) categoriaModal.show();
            }

            if (e.target.closest('.delete-btn')) {
                const row = e.target.closest('tr');
                categoriaToDeleteId = row.dataset.id;
                categoriaNomeExcluir.innerText = row.dataset.nome;
                if (confirmDeleteCategoriaModal) confirmDeleteCategoriaModal.show();
            }
        });
    }

    if (confirmDeleteCategoriaBtn) {
        confirmDeleteCategoriaBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('api/admin.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: categoriaToDeleteId, action: 'delete_categoria' })
                });
                const result = await response.json();

                if (result.success) {
                    alert(result.message);
                    if (confirmDeleteCategoriaModal) confirmDeleteCategoriaModal.hide();
                    loadCategorias();
                } else {
                    alert('Erro: ' + result.message);
                }
            } catch (error) {
                console.error('Erro na requisição de exclusão:', error);
                alert('Ocorreu um erro de comunicação ao excluir.');
            } finally {
                categoriaToDeleteId = null;
            }
        });
    }

    // --- Chamada de Inicialização (Categorias) ---
    const categoriasTabButton = document.getElementById('categorias-tab');
    if (categoriasTabButton) { // Adicionado verificação para garantir que o botão exista
        if (categoriasTabButton.classList.contains('active')) {
            loadCategorias();
        } else {
            categoriasTabButton.addEventListener('shown.bs.tab', loadCategorias, { once: true });
        }
    }


    // =========================================================================
    // FIM - BLOCO DE CATEGORIAS
    // =========================================================================


    // =========================================================================
    // INÍCIO - BLOCO DE ITENS DO CARDÁPIO (PRATOS/BEBIDAS)
    // =========================================================================

    let itemCardapioModal = null;
    let confirmDeleteItemModal = null;
    const itemCardapioModalElement = document.getElementById('itemCardapioModal');
    const confirmDeleteItemModalElement = document.getElementById('confirmDeleteItemModal');

    if (itemCardapioModalElement) {
        itemCardapioModal = new bootstrap.Modal(itemCardapioModalElement);
    }
    if (confirmDeleteItemModalElement) {
        confirmDeleteItemModal = new bootstrap.Modal(confirmDeleteItemModalElement);
    }

    // --- Variáveis de elementos DOM (Itens do Cardápio) ---
    const addItemCardapioBtn = document.getElementById('addItemCardapioBtn');
    const itemCardapioForm = document.getElementById('itemCardapioForm');
    const itemIdInput = document.getElementById('itemId');
    const itemNomeInput = document.getElementById('itemNome');
    const itemDescricaoInput = document.getElementById('itemDescricao');
    const itemPrecoInput = document.getElementById('itemPreco');
    const itemCategoriaSelect = document.getElementById('itemCategoria');
    const itemTipoSelect = document.getElementById('itemTipo');
    const saveItemCardapioBtn = document.getElementById('saveItemCardapioBtn');
    const itensCardapioTableBody = document.querySelector('#itensCardapioTable tbody');
    const itemNomeExcluir = document.getElementById('itemNomeExcluir');
    const confirmDeleteItemBtn = document.getElementById('confirmDeleteItemBtn');

    let itemToDeleteId = null;

    // --- Funções (Itens do Cardápio) ---
    async function loadItensCardapio() {
        try {
            const response = await fetch('api/admin.php?action=get_itens_cardapio&type=prato_bebida');
            const result = await response.json();

            if (result.success) {
                itensCardapioTableBody.innerHTML = '';
                if (result.data.length === 0) {
                    itensCardapioTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum item de prato/bebida cadastrado.</td></tr>';
                    return;
                }
                result.data.forEach(item => {
                    const row = `
                        <tr data-id="${item.id}" data-nome="${item.nome}" data-descricao="${item.descricao || ''}" data-preco="${item.preco}" data-categoria-id="${item.id_categoria || ''}" data-tipo="${item.tipo}">
                            <td>${item.id}</td>
                            <td>${item.nome}</td>
                            <td>${item.descricao || 'N/A'}</td>
                            <td>R$ ${parseFloat(item.preco).toFixed(2).replace('.', ',')}</td>
                            <td>${item.categoria_nome || 'N/A'}</td>
                            <td>${item.tipo}</td>
                            <td>
                                <button type="button" class="btn btn-sm btn-info me-2 edit-btn">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-danger delete-btn">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                    itensCardapioTableBody.innerHTML += row;
                });
            } else {
                itensCardapioTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Erro ao carregar itens: ${result.message}</td></tr>`;
            }
        } catch (error) {
            console.error('Erro ao carregar itens do cardápio:', error);
            itensCardapioTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Erro de comunicação com a API ao carregar itens.</td></tr>';
        }
    }

    // --- Listeners de Eventos (Itens do Cardápio) ---
    if (addItemCardapioBtn) {
        addItemCardapioBtn.addEventListener('click', () => {
            itemNomeInput.value = '';
            itemDescricaoInput.value = '';
            itemPrecoInput.value = '';
            itemCategoriaSelect.value = '';
            itemTipoSelect.value = 'prato';
            itemIdInput.value = '';
            document.getElementById('itemCardapioModalLabel').innerText = 'Adicionar Novo Item ao Cardápio';
            saveItemCardapioBtn.innerText = 'Salvar Item';
            if (itemCardapioModal) itemCardapioModal.show();
        });
    }

    if (itemCardapioForm) {
        itemCardapioForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = itemIdInput.value;
            const nome = itemNomeInput.value;
            const descricao = itemDescricaoInput.value;
            const preco = parseFloat(itemPrecoInput.value);
            const id_categoria = itemCategoriaSelect.value || null;
            const tipo = itemTipoSelect.value;
            const action = id ? 'update_item_cardapio' : 'add_item_cardapio';

            try {
                const response = await fetch('api/admin.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: id,
                        nome: nome,
                        descricao: descricao,
                        preco: preco,
                        id_categoria: id_categoria,
                        tipo: tipo,
                        action: action
                    })
                });
                const result = await response.json();

                if (result.success) {
                    alert(result.message);
                    if (itemCardapioModal) itemCardapioModal.hide();
                    loadItensCardapio();
                } else {
                    alert('Erro: ' + result.message);
                }
            } catch (error) {
                console.error('Erro na requisição:', error);
                alert('Ocorreu um erro de comunicação.');
            }
        });
    }

    if (itensCardapioTableBody) {
        itensCardapioTableBody.addEventListener('click', (e) => {
            if (e.target.closest('.edit-btn')) {
                const row = e.target.closest('tr');
                itemIdInput.value = row.dataset.id;
                itemNomeInput.value = row.dataset.nome;
                itemDescricaoInput.value = row.dataset.descricao;
                itemPrecoInput.value = row.dataset.preco;
                itemCategoriaSelect.value = row.dataset.categoriaId;
                itemTipoSelect.value = row.dataset.tipo;

                document.getElementById('itemCardapioModalLabel').innerText = 'Editar Item do Cardápio';
                saveItemCardapioBtn.innerText = 'Atualizar Item';
                if (itemCardapioModal) itemCardapioModal.show();
            }

            if (e.target.closest('.delete-btn')) {
                const row = e.target.closest('tr');
                itemToDeleteId = row.dataset.id;
                itemNomeExcluir.innerText = row.dataset.nome;
                if (confirmDeleteItemModal) confirmDeleteItemModal.show();
            }
        });
    }

    if (confirmDeleteItemBtn) {
        confirmDeleteItemBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('api/admin.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: itemToDeleteId, action: 'delete_item_cardapio' })
                });
                const result = await response.json();

                if (result.success) {
                    alert(result.message);
                    if (confirmDeleteItemModal) confirmDeleteItemModal.hide();
                    loadItensCardapio();
                } else {
                    alert('Erro: ' + result.message);
                }
            } catch (error) {
                console.error('Erro na requisição de exclusão:', error);
                alert('Ocorreu um erro de comunicação ao excluir.');
            } finally {
                itemToDeleteId = null;
            }
        });
    }

    // --- Chamada de Inicialização (Itens do Cardápio) ---
    const pratosTabButton = document.getElementById('pratos-tab');
    if (pratosTabButton) { // Adicionado verificação para garantir que o botão exista
        if (pratosTabButton.classList.contains('active')) {
            loadItensCardapio();
        } else {
            pratosTabButton.addEventListener('shown.bs.tab', loadItensCardapio, { once: true });
        }
    }


    // =========================================================================
    // FIM - BLOCO DE ITENS DO CARDÁPIO (PRATOS/BEBIDAS)
    // =========================================================================


    // =========================================================================
    // INÍCIO - BLOCO DE ATENDENTES
    // =========================================================================

    let atendenteModal = null;
    let confirmDeleteAtendenteModal = null;
    const atendenteModalElement = document.getElementById('atendenteModal');
    const confirmDeleteAtendenteModalElement = document.getElementById('confirmDeleteAtendenteModal');

    if (atendenteModalElement) {
        atendenteModal = new bootstrap.Modal(atendenteModalElement);
    }
    if (confirmDeleteAtendenteModalElement) {
        confirmDeleteAtendenteModal = new bootstrap.Modal(confirmDeleteAtendenteModalElement);
    }

    // --- Variáveis de elementos DOM (Atendentes) ---
    const addAtendenteBtn = document.getElementById('addAtendenteBtn');
    const atendenteForm = document.getElementById('atendenteForm');
    const atendenteIdInput = document.getElementById('atendenteId');
    const atendenteNomeUsuarioInput = document.getElementById('atendenteNomeUsuario');
    const atendenteNomeCompletoInput = document.getElementById('atendenteNomeCompleto');
    const atendenteSenhaInput = document.getElementById('atendenteSenha');
    const senhaHelpText = document.getElementById('senhaHelpText');
    const saveAtendenteBtn = document.getElementById('saveAtendenteBtn');
    const atendentesTableBody = document.querySelector('#atendentesTable tbody');
    const atendenteNomeExcluir = document.getElementById('atendenteNomeExcluir');
    const confirmDeleteAtendenteBtn = document.getElementById('confirmDeleteAtendenteBtn');

    let atendenteToDeleteId = null;

    // --- Funções (Atendentes) ---

    async function loadAtendentes() {
        try {
            const response = await fetch('api/admin.php?action=get_atendentes');
            const result = await response.json();

            if (result.success) {
                atendentesTableBody.innerHTML = '';
                if (result.data.length === 0) {
                    atendentesTableBody.innerHTML = '<tr><td colspan="4" class="text-center">Nenhum atendente cadastrado.</td></tr>';
                    return;
                }
                result.data.forEach(atendente => {
                    const row = `
                        <tr data-id="${atendente.id}" data-nome-usuario="${atendente.nome_usuario}" data-nome-completo="${atendente.nome_completo}">
                            <td>${atendente.id}</td>
                            <td>${atendente.nome_usuario}</td>
                            <td>${atendente.nome_completo}</td>
                            <td>
                                <button type="button" class="btn btn-sm btn-info me-2 edit-btn">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-danger delete-btn">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                    atendentesTableBody.innerHTML += row;
                });
            } else {
                atendentesTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Erro ao carregar atendentes: ${result.message}</td></tr>`;
            }
        } catch (error) {
            console.error('Erro ao carregar atendentes:', error);
            atendentesTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Erro de comunicação com a API ao carregar atendentes.</td></tr>';
        }
    }

    // --- Listeners de Eventos (Atendentes) ---
    if (addAtendenteBtn) {
        addAtendenteBtn.addEventListener('click', () => {
            atendenteIdInput.value = '';
            atendenteNomeUsuarioInput.value = '';
            atendenteNomeCompletoInput.value = '';
            atendenteSenhaInput.value = '';
            atendenteSenhaInput.setAttribute('required', 'required');
            if (senhaHelpText) { // Verifica se o elemento existe antes de tentar acessar style
                senhaHelpText.style.display = 'none';
            }
            document.getElementById('atendenteModalLabel').innerText = 'Adicionar Novo Atendente';
            saveAtendenteBtn.innerText = 'Salvar Atendente';
            if (atendenteModal) atendenteModal.show();
        });
    }

    if (atendenteForm) {
        atendenteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = atendenteIdInput.value;
            const nome_usuario = atendenteNomeUsuarioInput.value;
            const nome_completo = atendenteNomeCompletoInput.value;
            const senha = atendenteSenhaInput.value;

            let action;
            let bodyData = {
                nome_usuario: nome_usuario,
                nome_completo: nome_completo,
            };

            if (id) {
                action = 'update_atendente';
                bodyData.id = id;
                if (senha) {
                    bodyData.senha = senha;
                }
            } else {
                action = 'add_atendente';
                bodyData.senha = senha;
            }

            try {
                const response = await fetch('api/admin.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...bodyData, action: action })
                });
                const result = await response.json();

                if (result.success) {
                    alert(result.message);
                    if (atendenteModal) atendenteModal.hide();
                    loadAtendentes();
                } else {
                    alert('Erro: ' + result.message);
                }
            } catch (error) {
                console.error('Erro na requisição:', error);
                alert('Ocorreu um erro de comunicação.');
            }
        });
    }

    if (atendentesTableBody) {
        atendentesTableBody.addEventListener('click', (e) => {
            if (e.target.closest('.edit-btn')) {
                const row = e.target.closest('tr');
                atendenteIdInput.value = row.dataset.id;
                atendenteNomeUsuarioInput.value = row.dataset.nomeUsuario;
                atendenteNomeCompletoInput.value = row.dataset.nomeCompleto;
                atendenteSenhaInput.value = '';
                atendenteSenhaInput.removeAttribute('required');
                if (senhaHelpText) { // Verifica se o elemento existe antes de tentar acessar style
                    senhaHelpText.style.display = 'block';
                }
                document.getElementById('atendenteModalLabel').innerText = 'Editar Atendente';
                saveAtendenteBtn.innerText = 'Atualizar Atendente';
                if (atendenteModal) atendenteModal.show();
            }

            if (e.target.closest('.delete-btn')) {
                const row = e.target.closest('tr');
                atendenteToDeleteId = row.dataset.id;
                atendenteNomeExcluir.innerText = row.dataset.nomeCompleto;
                if (confirmDeleteAtendenteModal) confirmDeleteAtendenteModal.show();
            }
        });
    }

    if (confirmDeleteAtendenteBtn) {
        confirmDeleteAtendenteBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('api/admin.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: atendenteToDeleteId, action: 'delete_atendente' })
                });
                const result = await response.json();

                if (result.success) {
                    alert(result.message);
                    if (confirmDeleteAtendenteModal) confirmDeleteAtendenteModal.hide();
                    loadAtendentes();
                } else {
                    alert('Erro: ' + result.message);
                }
            } catch (error) {
                console.error('Erro na requisição de exclusão:', error);
                alert('Ocorreu um erro de comunicação ao excluir.');
            } finally {
                atendenteToDeleteId = null;
            }
        });
    }

    // --- Chamada de Inicialização (Atendentes) ---
    const atendentesTabButton = document.getElementById('atendentes-tab');
    if (atendentesTabButton) { // ESSA É A VERIFICAÇÃO CHAVE
        if (atendentesTabButton.classList.contains('active')) {
            loadAtendentes();
        } else {
            atendentesTabButton.addEventListener('shown.bs.tab', loadAtendentes, { once: true });
        }
    }

    // =========================================================================
    // FIM - BLOCO DE ATENDENTES
    // =========================================================================

}); // Fim do DOMContentLoaded principal