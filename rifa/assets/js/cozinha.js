document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos HTML
    const novosPedidosContainer = document.getElementById('novosPedidos');
    const emPreparoContainer = document.getElementById('emPreparo');
    const notificationPermissionWarning = document.getElementById('notificationPermissionWarning'); // O aviso no topo da página
    const badgeNovosPedidos = document.getElementById('badgeNovosPedidos'); // O badge para novos pedidos
    const badgeEmPreparo = document.getElementById('badgeEmPreparo');     // O badge para pedidos em preparo

    // Configuração do áudio de notificação
    // ATENÇÃO: Confirme que 'notification.mp3' é o nome exato e o formato correto do seu arquivo na pasta 'assets/sounds/'
    const audioNotification = new Audio('../assets/sounds/notification_v2.mp3');
    
    // Variáveis de controle para a lógica de notificação
    let lastKnownNewOrdersCount = 0; // Armazena a contagem de novos pedidos na última verificação
    let isInitialLoad = true;        // Flag para evitar que o som toque na primeira carga da página

    // --- Função para Solicitar Permissão de Notificação ---
    function requestNotificationPermission() {
        // Verifica se o navegador suporta a API de Notificações
        if (!("Notification" in window)) {
            console.warn("Este navegador não suporta notificações de desktop.");
            return;
        }

        // Verifica o status atual da permissão
        if (Notification.permission === "default") {
            // Se a permissão não foi concedida nem negada, solicita ao usuário
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    console.log("Permissão para notificações concedida!");
                    if (notificationPermissionWarning) {
                        notificationPermissionWarning.style.display = 'none'; // Esconde o aviso
                    }
                    // Opcional: Você pode enviar uma notificação de teste visual aqui
                    // new Notification("Notificações ativadas!", { body: "Você receberá alertas de novos pedidos.", icon: '../assets/img/logo.png' });
                } else {
                    console.warn("Permissão para notificações negada.");
                    if (notificationPermissionWarning) {
                        notificationPermissionWarning.style.display = 'block'; // Mostra o aviso
                    }
                }
            });
        } else if (Notification.permission === "denied") {
            // Se a permissão foi negada, informa ao usuário que ele precisa mudar manualmente
            console.warn("Permissão para notificações foi negada. Por favor, altere nas configurações do navegador.");
            if (notificationPermissionWarning) {
                notificationPermissionWarning.style.display = 'block'; // Mostra o aviso
            }
        } else if (Notification.permission === "granted") {
            // Permissão já concedida
            console.log("Permissão para notificações já concedida.");
            if (notificationPermissionWarning) {
                notificationPermissionWarning.style.display = 'none'; // Esconde o aviso
            }
        }
    }

    // --- Função para tentar desbloquear o áudio na primeira interação do usuário ---
    function enableAudioOnUserInteraction() {
        // Esta função tenta tocar o áudio com volume muito baixo para "ativar"
        // a permissão de áudio do navegador.
        // Só executa se o áudio ainda não foi desbloqueado e não está tocando.
        if (audioNotification.volume === 1 && !audioNotification.paused) {
             return;
        }

        audioNotification.volume = 0.01; // Quase mudo para não incomodar
        audioNotification.play()
            .then(() => {
                audioNotification.volume = 1; // Volta o volume normal para futuras notificações
                console.log("Áudio desbloqueado com sucesso!");
                // Remove os event listeners para que essa função só seja chamada uma vez
                document.removeEventListener('click', userInteractionHandler);
                document.removeEventListener('touchstart', userInteractionHandler);
            })
            .catch(e => {
                console.warn("Áudio ainda não liberado ou erro no play inicial:", e);
                audioNotification.volume = 1; // Reseta o volume em caso de falha
                // O aviso de permissão de notificação também pode servir para o áudio
                if (notificationPermissionWarning) {
                    notificationPermissionWarning.style.display = 'block';
                }
            });
    }

    // --- Handler único para qualquer interação do usuário (clique/toque) ---
    // Este handler é chamado uma única vez para desbloquear áudio e solicitar permissão
    const userInteractionHandler = () => {
        enableAudioOnUserInteraction();
        requestNotificationPermission(); // Solicita permissão de notificação no primeiro clique/toque
    };

    // Adiciona ouvintes para o primeiro clique/toque na página
    document.addEventListener('click', userInteractionHandler, { once: true }); // '{ once: true }' garante que o evento dispara só uma vez
    document.addEventListener('touchstart', userInteractionHandler, { once: true }); // Para dispositivos móveis

    // --- Função Principal: Carregar e Atualizar Pedidos ---
    const carregarPedidos = async () => {
        try {
            const response = await fetch('api/pedidos.php?status=cozinha');
            const data = await response.json();

            const currentNewOrdersCount = data.novos.length;

            // Lógica para tocar o som de notificação
            // Só toca se não for a carga inicial E se o número de novos pedidos aumentou
            if (!isInitialLoad && currentNewOrdersCount > lastKnownNewOrdersCount) {
                // Toca o som APENAS se o áudio já foi liberado pelo navegador (volume não está em 0.01)
                if (audioNotification.volume > 0.01) {
                    audioNotification.play().catch(e => console.error("Erro ao tocar áudio:", e));
                    if ('vibrate' in navigator) { // Para dispositivos que suportam vibração
                        navigator.vibrate(200);
                    }
                } else {
                    console.warn("Novo pedido, mas áudio ainda bloqueado pelo navegador. Usuário precisa interagir.");
                    if (notificationPermissionWarning) {
                        notificationPermissionWarning.style.display = 'block'; // Mostra o aviso se o som não pôde tocar
                    }
                }

                // Envia uma Notificação Visual (se a permissão foi concedida e há novos pedidos)
                if (Notification.permission === "granted" && data.novos.length > 0) {
                    new Notification("Novo Pedido!", {
                        body: `Mesa ${data.novos[0].numero_mesa} tem um novo pedido.`,
                        icon: '../assets/img/logo.png' // Certifique-se de ter um ícone pequeno aqui
                    });
                }
            }
            
            // Atualiza a contagem para a próxima verificação
            lastKnownNewOrdersCount = currentNewOrdersCount;
            isInitialLoad = false;

            // Atualiza os badges de contagem na interface
            if (badgeNovosPedidos) badgeNovosPedidos.innerText = currentNewOrdersCount;
            if (badgeEmPreparo) badgeEmPreparo.innerText = data.em_preparo.length;

            // Limpa os containers e renderiza os pedidos
            novosPedidosContainer.innerHTML = '';
            emPreparoContainer.innerHTML = '';

            data.novos.forEach(pedido => {
                novosPedidosContainer.innerHTML += criarCardPedido(pedido, 'preparar');
            });

            data.em_preparo.forEach(pedido => {
                emPreparoContainer.innerHTML += criarCardPedido(pedido, 'pronto');
            });

        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
            isInitialLoad = true; // Mantém a flag de carga inicial como true em caso de erro na requisição
            // Opcional: Pode mostrar uma mensagem de erro na UI aqui se a API não responder
        }
    };

    // --- Função para Criar o Card de Pedido (HTML) ---
    const criarCardPedido = (pedido, acao) => {
        let itensList = '';
        pedido.itens.forEach(item => {
            itensList += `<li>${item.quantidade}x ${item.nome} ${item.observacao ? `(<em>${item.observacao}</em>)` : ''}</li>`;
        });

        const btnClass = acao === 'preparar' ? 'btn-primary' : 'btn-success';
        const btnText = acao === 'preparar' ? 'Iniciar Preparo' : 'Pedido Pronto';
        const novoStatus = acao === 'preparar' ? 'em_preparo' : 'pronto';

        // Lógica para aplicar as classes de status de cozinha
        let cardStatusClass = '';
        if (pedido.status === 'novo') {
            cardStatusClass = 'pedido-novo'; // Classe para novo pedido (vermelho piscando)
        } else if (pedido.status === 'em_preparo') {
            cardStatusClass = 'pedido-preparando'; // Classe para pedido em preparo (laranja piscando)
        } else if (pedido.status === 'pronto') {
            cardStatusClass = 'pedido-pronto-kitch'; // Classe para pedido pronto (verde, sem piscar na cozinha)
        }
        // Se houver outros status, adicione-os aqui. Por exemplo, um padrão.
        // else { cardStatusClass = 'bg-light text-dark'; } // Classe padrão

        return `
            <div class="card pedido-card mb-3 ${cardStatusClass}">
                <div class="card-body">
                    <h5 class="card-title">Mesa ${pedido.numero_mesa}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">Cliente: ${pedido.nome_cliente || 'N/A'}</h6>
                    <ul>${itensList}</ul>
                    <button class="btn ${btnClass} w-100 btn-atualizar-status" data-id-pedido="${pedido.id}" data-novo-status="${novoStatus}">
                        ${btnText}
                    </button>
                </div>
            </div>
        `;
    };
    
    // --- Função para Atualizar o Status do Pedido via API ---
    const atualizarStatusPedido = async (idPedido, novoStatus) => {
        try {
            const response = await fetch('api/pedidos.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    id_pedido: idPedido,
                    action: 'update_status',
                    novo_status: novoStatus
                })
            });
            const result = await response.json();
            if(result.success) {
                carregarPedidos(); // Recarrega a lista após a atualização
            } else {
                alert('Erro ao atualizar status: ' + result.message);
            }
        } catch (error) {
            console.error('Erro na requisição de atualização:', error);
        }
    };

    // --- Delegação de Eventos para os Botões de Atualização de Status ---
    document.body.addEventListener('click', (e) => {
        // Verifica se o clique foi em um botão com a classe 'btn-atualizar-status'
        if(e.target && e.target.classList.contains('btn-atualizar-status')) {
            const idPedido = e.target.dataset.idPedido;
            const novoStatus = e.target.dataset.novoStatus;
            atualizarStatusPedido(idPedido, novoStatus);
        }
    });

    // --- Inicialização: Carrega os pedidos pela primeira vez e configura o intervalo de atualização ---
    carregarPedidos();
    setInterval(carregarPedidos, 10000); // Recarrega a cada 10 segundos
});