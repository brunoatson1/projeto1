<?php
// Para garantir que os erros sejam exibidos (mantenha isso por enquanto para depura��o)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// O config.php ser� inclu�do VIA auth_check.php.
// auth_check.php DEVE SER O PRIMEIRO INCLUDE EM QUALQUER P�GINA PROTEGIDA.
require_once 'includes/auth_check.php';

// As defini��es de t�tulo e JS podem vir depois das verifica��es de seguran�a.
$page_title = 'Painel da Cozinha';
$custom_js = 'assets/js/cozinha.js';

// Redireciona se n�o for da cozinha
if (!isset($_SESSION['user_tipo']) || $_SESSION['user_tipo'] !== 'cozinha') {
    header('Location: ' . BASE_URL . 'atendente.php');
    exit;
}

// A partir daqui, o usu�rio � 'cozinha' e est� logado.
require_once 'includes/header.php'; // Inclua o cabe�alho HTML AP�S todas as verifica��es.
?>

<div class="container-fluid mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>Controle de Pedidos</h1>
    </div>

    <div id="notificationPermissionWarning" class="alert alert-warning alert-dismissible fade show" style="display:none;" role="alert">
        🔔 Para receber **alertas sonoros e visuais** de **novos pedidos**, por favor, **clique em qualquer lugar desta página** e **permita as notificações** se for solicitado pelo seu navegador.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>

    <div class="row">
        <div class="col-lg-6 col-md-12 mb-4">
            <h4 class="text-center text-white"><i class="bi bi-bell-fill"></i> Novos Pedidos <span class="badge bg-danger" id="badgeNovosPedidos">0</span></h4>
            <div id="novosPedidos" class="row row-cols-1 row-cols-sm-1 row-cols-md-1 row-cols-lg-2 row-cols-xl-3 g-3">
                <div class="text-center p-3 w-100">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Carregando novos pedidos...</span>
                    </div>
                    <p class="text-white mt-2">Carregando novos pedidos...</p>
                </div>
            </div>
        </div>

        <div class="col-lg-6 col-md-12 mb-4">
            <h4 class="text-center text-white"><i class="bi bi-fire"></i> Em Preparo <span class="badge bg-warning" id="badgeEmPreparo">0</span></h4>
            <div id="emPreparo" class="row row-cols-1 row-cols-sm-1 row-cols-md-1 row-cols-lg-2 row-cols-xl-3 g-3">
                <div class="text-center p-3 w-100">
                    <div class="spinner-border text-info" role="status">
                        <span class="visually-hidden">Carregando pedidos em preparo...</span>
                    </div>
                    <p class="text-white mt-2">Carregando pedidos em preparo...</p>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>

<?php require_once 'includes/footer.php'; ?>