<?php
// 1. INCLUI O CONFIG.PHP PRIMEIRO.
// Ele define as constantes de BD, BASE_URL e inicia a sessão (session_start() e ob_start()).
require_once 'config.php'; // Caminho relativo à pasta onde admin.php está

// 2. INCLUI O AUTH_CHECK.PHP PARA VERIFICAÇÃO DE AUTENTICAÇÃO E REDIRECIONAMENTOS
// Isso deve acontecer ANTES de qualquer HTML ser enviado.
require_once 'includes/auth_check.php';

// 3. Define o título da página
$page_title = 'Painel de Administração';

// 4. Inclui o cabeçalho HTML.
// Não precisa mais incluir config.php pois já foi incluído acima.
require_once 'includes/header.php';

// Redireciona se o usuário logado NÃO for um administrador.
// Isso é uma segunda linha de defesa. Se auth_check.php já redirecionou, este bloco não será alcançado.
if (!isset($_SESSION['user_tipo']) || $_SESSION['user_tipo'] !== 'admin') {
    header('Location: ' . BASE_URL . 'index.php'); // O ob_start() no config.php deve lidar com isso
    exit;
}

// Determina qual seção do painel de administração deve ser exibida.
$section = $_GET['section'] ?? 'dashboard';

?>

<div class="container-fluid mt-4">
    <div class="row">
        <nav id="sidebarMenu" class="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
            <div class="position-sticky pt-3">
                <ul class="nav flex-column">
                    <li class="nav-item">
                        <a class="nav-link <?php echo ($section === 'dashboard') ? 'active' : ''; ?>" aria-current="page" href="admin.php?section=dashboard">
                            <i class="bi bi-house-door"></i> Dashboard
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?php echo ($section === 'cardapio') ? 'active' : ''; ?>" href="admin.php?section=cardapio">
                            <i class="bi bi-book"></i> Gerenciar Cardápio
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?php echo ($section === 'atendentes') ? 'active' : ''; ?>" href="admin.php?section=atendentes">
                            <i class="bi bi-people"></i> Gerenciar Atendentes
                        </a>
                    </li>
                </ul>
            </div>
        </nav>

        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 class="h2"><?php echo ucfirst($section); ?></h1>
            </div>

            <?php
            // Inclui o arquivo do módulo correspondente à seção selecionada
            switch ($section) {
                case 'dashboard':
                    require_once 'admin_modules/dashboard.php';
                    break;
                case 'cardapio':
                    require_once 'admin_modules/cardapio_gerenciar_pratos.php';
                    break;
                case 'atendentes':
                    require_once 'admin_modules/atendentes_gerenciar.php';
                    break;
                default:
                    echo '<div class="alert alert-danger" role="alert">Seção não encontrada.</div>';
                    break;
            }
            ?>

        </main>
    </div>
</div>

<?php
// Define o JavaScript customizado para o painel admin (será carregado no footer)
$custom_js = 'assets/js/admin.js';
// Inclui o rodapé
require_once 'includes/footer.php';
?>