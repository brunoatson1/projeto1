<?php
// Este arquivo Ã© incluÃ­do por admin.php, entÃ£o jÃ¡ tem acesso a $pdo e $_SESSION.
// NÃ£o precisa de includes/header.php ou includes/auth_check.php aqui.

// Pode ser Ãºtil definir uma variÃ¡vel para a sub-seÃ§Ã£o da aba ativa, se necessÃ¡rio
$cardapio_tab = $_GET['tab'] ?? 'pratos'; // PadrÃ£o para a aba 'pratos'
?>

<div class="card shadow-sm mb-4">
    <div class="card-header bg-light">
        <h5 class="mb-0">Gerenciar Cardápio</h5>
    </div>
    <div class="card-body">
        <ul class="nav nav-tabs mb-3" id="cardapioTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link <?php echo ($cardapio_tab === 'pratos') ? 'active' : ''; ?>"
                        id="pratos-tab" data-bs-toggle="tab" data-bs-target="#pratos"
                        type="button" role="tab" aria-controls="pratos" aria-selected="<?php echo ($cardapio_tab === 'pratos') ? 'true' : 'false'; ?>">
                    <i class="bi bi-food me-2"></i>Pratos e Bebidas
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link <?php echo ($cardapio_tab === 'categorias') ? 'active' : ''; ?>"
                        id="categorias-tab" data-bs-toggle="tab" data-bs-target="#categorias"
                        type="button" role="tab" aria-controls="categorias" aria-selected="<?php echo ($cardapio_tab === 'categorias') ? 'true' : 'false'; ?>">
                    <i class="bi bi-tags me-2"></i>Categorias
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link <?php echo ($cardapio_tab === 'sabores-adicionais') ? 'active' : ''; ?>"
                        id="sabores-adicionais-tab" data-bs-toggle="tab" data-bs-target="#sabores-adicionais"
                        type="button" role="tab" aria-controls="sabores-adicionais" aria-selected="<?php echo ($cardapio_tab === 'sabores-adicionais') ? 'true' : 'false'; ?>">
                    <i class="bi bi-plus-circle me-2"></i>Sabores e Adicionais
                </button>
            </li>
        </ul>

        <div class="tab-content" id="cardapioTabContent">
            <div class="tab-pane fade <?php echo ($cardapio_tab === 'pratos') ? 'show active' : ''; ?>" id="pratos" role="tabpanel" aria-labelledby="pratos-tab">
                <?php require_once 'admin_modules/cardapio_gerenciar_pratos_content.php'; // CONTEÚDO REAL AQUI ?>
            </div>

            <div class="tab-pane fade <?php echo ($cardapio_tab === 'categorias') ? 'show active' : ''; ?>" id="categorias" role="tabpanel" aria-labelledby="categorias-tab">
                <?php require_once 'admin_modules/cardapio_gerenciar_categorias.php'; // CONTEÚDO REAL AQUI ?>
            </div>

            <div class="tab-pane fade <?php echo ($cardapio_tab === 'sabores-adicionais') ? 'show active' : ''; ?>" id="sabores-adicionais" role="tabpanel" aria-labelledby="sabores-adicionais-tab">
                <?php require_once 'admin_modules/cardapio_gerenciar_sabores_adicionais.php'; // CONTEÚDO REAL AQUI ?>
            </div>
        </div>
    </div>
</div>

<script>
    // Script para persistir a aba ativa na URL
    document.addEventListener('DOMContentLoaded', function() {
        const cardapioTabs = document.getElementById('cardapioTabs');
        if (cardapioTabs) {
            const tabButtons = cardapioTabs.querySelectorAll('.nav-link');
            tabButtons.forEach(button => {
                button.addEventListener('shown.bs.tab', function (event) {
                    const activeTabId = event.target.id; // e.g., "pratos-tab"
                    const newTab = activeTabId.replace('-tab', ''); // e.g., "pratos"
                    
                    // Atualiza a URL sem recarregar a página
                    const url = new URL(window.location);
                    url.searchParams.set('tab', newTab);
                    window.history.pushState({}, '', url);
                });
            });

            // Ativa a aba correta ao carregar a página se 'tab' estiver na URL
            const urlParams = new URLSearchParams(window.location.search);
            const activeTab = urlParams.get('tab');
            if (activeTab) {
                const tabElement = document.getElementById(`${activeTab}-tab`);
                if (tabElement) {
                    const bsTab = new bootstrap.Tab(tabElement);
                    bsTab.show();
                }
            }
        }
    });
</script>