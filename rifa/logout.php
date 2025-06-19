<?php
require_once 'config.php';

// Limpa todas as variáveis de sessão
$_SESSION = array();

// Destrói a sessão
session_destroy();

// Redireciona para a página de login
header('Location: ' . BASE_URL . 'index.php');
exit;
?>