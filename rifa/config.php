<?php
// Ativa bufferização de saída para prevenir erros de header
ob_start();

// INICIA A SESSÃO PHP
session_start(); // <--- LINHA ADICIONADA AQUI

// ================= CONFIGURAÇÕES ESSENCIAIS =================
define('BASE_URL', 'https://atsconect.com.br/rifa/');
date_default_timezone_set('America/Sao_Paulo');

// ================= CONEXÃO COM BANCO DE DADOS =================
define('DB_HOST', 'localhost');
define('DB_USER', 'brun8138_rufauser');
define('DB_PASS', 'Br92025957@');
define('DB_NAME', 'brun8138_rifas');

try {
    $pdo = new PDO(
        "mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    header('HTTP/1.1 500 Internal Server Error');
    exit('Erro crítico no sistema. Contate o administrador.');
}

// NUNCA deixe espaços ou linhas após o fechamento ?>