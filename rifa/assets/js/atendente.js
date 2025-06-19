document.addEventListener('DOMContentLoaded', () => {
    const mesasContainer = document.getElementById('mesasContainer');
    const pedidoModal = new bootstrap.Modal(document.getElementById('pedidoModal'));
    const modalTitle = document.getElementById('pedidoModalLabel');
    const cardapioContainer = document.getElementById('cardapioContainer');
    const resumoPedidoContainer = document.getElementById('resumoPedido');
    const formNovoPedido = document.getElementById('formNovoPedido');
    const formPedidoExistente = document.getElementById('formPedidoExistente');
    const btnFecharConta = document.getElementById('btnFecharConta');
    
    let pedidoAtual = {
        id_mesa: null,
        id_pedido: null,
        nome_cliente: '',
        itens: []
    };

    // Função para buscar e renderizar as mesas
    const carregarMesas = async () => {
        try {
            const response = await fetch('api/mesas.php');
            const mesas = await response.json();
            
            mesasContainer.innerHTML = '';
            mesas.forEach(mesa => {
                let statusClass = ''; // Variável para a classe de cor/pulsar
                let statusBadgeText = ''; // Texto que aparecerá no badge
                
                // Lógica para definir a classe de status baseada no status da mesa
                // e no status_pedido (se houver um pedido pronto na mesa)
                if (mesa.status_pedido === 'pronto') {
                    // Se o pedido na mesa está pronto (cozinha marcou), ela pisca amarelo
                    statusClass = 'mesa-status-pedido-pronto';
                    statusBadgeText = 'PEDIDO PRONTO';
                } else if (mesa.status === 'livre') {
                    // Se a mesa está livre
                    statusClass = 'mesa-status-livre';
                    statusBadgeText = 'LIVRE';
                } else if (mesa.status === 'ocupada') {
                    // Se a mesa está ocupada (mas o pedido não está pronto)
                    statusClass = 'mesa-status-ocupada';
                    statusBadgeText = 'OCUPADA';
                } else {
                    // Status padrão para qualquer outro caso
                    statusClass = 'bg-secondary text-white'; // Fallback visual
                    statusBadgeText = 'DESCONHECIDO';
                }

                const mesaCard = `
                    <div class="col-md-3 col-sm-6 mb-4">
                        <div class="card text-center mesa-card ${statusClass}" data-id-mesa="${mesa.id}" data-status="${mesa.status}">
                            <div class="card-body">
                                <h5 class="card-title">Mesa</h5>
                                <p class="mesa-numero">${mesa.numero}</p>
                                <span class="badge bg-secondary text-uppercase">${statusBadgeText}</span>
                            </div>
                        </div>
                    </div>
                `;
                mesasContainer.innerHTML += mesaCard;
            });
        } catch (error) {
            console.error("Erro ao carregar mesas:", error);
            // Opcional: Adicionar uma mensagem de erro na UI
            mesasContainer.innerHTML = '<div class="col-12"><div class="alert alert-danger text-center">Não foi possível carregar as mesas.</div></div>';
        }
    };

    // Função para carregar o cardápio no modal
    const carregarCardapio = async () => {
        try {
            const response = await fetch('api/cardapio.php');
            const categorias = await response.json();
            
            cardapioContainer.innerHTML = '';
            categorias.forEach(categoria => {
                let itensHTML = '';
                categoria.itens.forEach(item => {
                    itensHTML += `
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <strong>${item.nome}</strong><br>
                                <small>R$ ${parseFloat(item.preco).toFixed(2)}</small>
                            </div>
                            <button class="btn btn-sm btn-success btn-add-item" data-id-item="${item.id}" data-nome="${item.nome}" data-preco="${item.preco}">+</button>
                        </li>
                    `;
                });

                cardapioContainer.innerHTML += `
                    <h5 class="mt-3">${categoria.nome}</h5>
                    <ul class="list-group">${itensHTML}</ul>
                `;
            });
        } catch (error) {
            console.error("Erro ao carregar cardápio:", error);
            cardapioContainer.innerHTML = '<div class="alert alert-danger text-center">Não foi possível carregar o cardápio.</div>';
        }
    };

    // Função para renderizar o resumo do pedido
    const renderizarResumo = () => {
        resumoPedidoContainer.innerHTML = '';
        if (pedidoAtual.itens.length === 0) {
            resumoPedidoContainer.innerHTML = '<p>Nenhum item adicionado.</p>';
            return;
        }

        let total = 0;
        const itensList = document.createElement('ul');
        itensList.className = 'list-group';
        
        pedidoAtual.itens.forEach((item, index) => {
            const itemTotal = item.quantidade * item.preco;
            total += itemTotal;
            itensList.innerHTML += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        ${item.quantidade}x ${item.nome}
                        ${item.observacao ? `<br><small><em>Obs: ${item.observacao}</em></small>` : ''}
                    </div>
                    <div>
                        <span>R$ ${itemTotal.toFixed(2)}</span>
                        <button class="btn btn-sm btn-danger btn-remove-item ms-2" data-index="${index}">X</button>
                    </div>
                </li>
            `;
        });
        resumoPedidoContainer.appendChild(itensList);
        resumoPedidoContainer.innerHTML += `<h5 class="text-end mt-3">Total: R$ ${total.toFixed(2)}</h5>`;
    };

    // Event listener para clicar em uma mesa
    mesasContainer.addEventListener('click', async (e) => {
        const mesaCard = e.target.closest('.mesa-card');
        if (!mesaCard) return;

        pedidoAtual.id_mesa = mesaCard.dataset.idMesa;
        
        if (mesaCard.dataset.status === 'livre') {
            modalTitle.textContent = `Novo Pedido - Mesa ${pedidoAtual.id_mesa}`;
            document.getElementById('clienteNome').value = '';
            pedidoAtual.itens = [];
            pedidoAtual.id_pedido = null;
            renderizarResumo();
            formNovoPedido.style.display = 'block';
            formPedidoExistente.style.display = 'none';
            btnFecharConta.style.display = 'none';
            pedidoModal.show();
        } else {
            // Carregar dados do pedido existente
            try {
                // Ao carregar um pedido existente, precisamos saber se ele está em 'pedido_pronto'
                // para desativar o pulsar dessa mesa específica
                const response = await fetch(`api/pedidos.php?id_mesa=${pedidoAtual.id_mesa}`);
                const pedidoData = await response.json();
                
                if(pedidoData && pedidoData.id) {
                    modalTitle.textContent = `Detalhes do Pedido - Mesa ${pedidoAtual.id_mesa}`;
                    pedidoAtual.id_pedido = pedidoData.id;
                    pedidoAtual.itens = pedidoData.itens;
                    renderizarResumo();

                    document.getElementById('statusPedido').textContent = pedidoData.status.replace('_', ' ').toUpperCase();
                    document.getElementById('clienteNomeExistente').textContent = pedidoData.nome_cliente;
                    
                    formNovoPedido.style.display = 'none';
                    formPedidoExistente.style.display = 'block';
                    btnFecharConta.style.display = 'block';
                    
                    const formaPagamentoSelect = document.getElementById('formaPagamento');
                    formaPagamentoSelect.value = pedidoData.forma_pagamento || 'nao_definido';

                    pedidoModal.show();
                } else {
                    alert('Não foi possível carregar os dados do pedido.');
                }
            } catch (error) {
                console.error("Erro ao carregar pedido existente:", error);
                alert('Erro ao carregar detalhes do pedido.');
            }
        }
    });

    // Event listener para adicionar item ao pedido
    cardapioContainer.addEventListener('click', (e) => {
        if (!e.target.classList.contains('btn-add-item')) return;
        
        const idItem = e.target.dataset.idItem;
        const itemExistente = pedidoAtual.itens.find(i => i.id_item_cardapio === idItem);

        if (itemExistente) {
            itemExistente.quantidade++;
        } else {
            pedidoAtual.itens.push({
                id_item_cardapio: idItem,
                nome: e.target.dataset.nome,
                preco: parseFloat(e.target.dataset.preco),
                quantidade: 1,
                observacao: ''
            });
        }
        renderizarResumo();
    });

    // Event listener para remover item do pedido
    resumoPedidoContainer.addEventListener('click', (e) => {
        if (!e.target.classList.contains('btn-remove-item')) return;
        const index = e.target.dataset.index;
        pedidoAtual.itens.splice(index, 1);
        renderizarResumo();
    });

    // Event listener para enviar novo pedido
    formNovoPedido.addEventListener('submit', async (e) => {
        e.preventDefault();
        pedidoAtual.nome_cliente = document.getElementById('clienteNome').value;

        if(pedidoAtual.itens.length === 0) {
            alert('Adicione pelo menos um item ao pedido.');
            return;
        }

        // Adiciona a lógica para desabilitar o botão e mostrar spinner (opcional, mas bom para UX)
        const submitBtn = formNovoPedido.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...';

        try {
            const response = await fetch('api/pedidos.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(pedidoAtual)
            });
            const result = await response.json();
            if(result.success) {
                pedidoModal.hide();
                carregarMesas(); // Recarrega as mesas para atualizar o status visual
            } else {
                alert('Erro ao criar pedido: ' + result.message);
            }
        } catch (error) {
            console.error("Erro ao enviar pedido:", error);
            alert('Erro de conexão ao enviar pedido.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Fazer Pedido'; // Restaura o texto original
        }
    });
    
    // Event listener para fechar conta
    btnFecharConta.addEventListener('click', async () => {
        const formaPagamento = document.getElementById('formaPagamento').value;
        if(formaPagamento === 'nao_definido') {
            alert('Por favor, selecione a forma de pagamento.');
            return;
        }

        const dados = {
            id_pedido: pedidoAtual.id_pedido,
            action: 'finalizar',
            forma_pagamento: formaPagamento
        };
        
        // Desabilitar o botão e mostrar spinner
        btnFecharConta.disabled = true;
        btnFecharConta.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Finalizando...';

        try {
            const response = await fetch('api/pedidos.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(dados)
            });
            const result = await response.json();
            if(result.success) {
                alert('Pedido finalizado com sucesso!');
                pedidoModal.hide();
                carregarMesas(); // Recarrega as mesas para atualizar o status visual para "Livre"
            } else {
                alert('Erro ao finalizar pedido: ' + result.message);
            }
        } catch (error) {
            console.error("Erro ao fechar conta:", error);
            alert('Erro de conexão ao finalizar pedido.');
        } finally {
            btnFecharConta.disabled = false;
            btnFecharConta.innerHTML = 'Fechar Conta'; // Restaura o texto original
        }
    });

    // Iniciar
    carregarMesas();
    carregarCardapio();
    setInterval(carregarMesas, 15000); // Atualiza as mesas a cada 15 segundos
});