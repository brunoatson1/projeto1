<?php
// OBRIGATÓRIO: Inclui o config.php para ter acesso a BASE_URL e session_start()
require_once $_SERVER['DOCUMENT_ROOT'] . '/rifa/config.php';

// REDIRECIONAMENTO SE NÃO AUTENTICADO
if (empty($_SESSION['user_id'])) {
    header('Location: ' . BASE_URL . 'index.php');
    exit();
}
// NÃO FECHE COM ?>