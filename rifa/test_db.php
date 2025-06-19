<?php
require_once 'config.php'; // Garante que o config.php está no mesmo nível

echo "<h1>Teste de Conexão com o Banco de Dados</h1>";

if (isset($pdo)) {
    echo "<p style='color: green;'>Conexão com o banco de dados estabelecida com sucesso!</p>";
    try {
        $stmt = $pdo->query("SELECT NOW() as current_time");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "<p>Hora atual do servidor do banco de dados: <strong>" . htmlspecialchars($result['current_time']) . "</strong></p>";
    } catch (PDOException $e) {
        echo "<p style='color: red;'>Erro ao executar uma consulta de teste: " . htmlspecialchars($e->getMessage()) . "</p>";
        error_log('Teste de DB - Erro na consulta: ' . $e->getMessage());
    }
} else {
    echo "<p style='color: red;'>Erro: A variável \$pdo não foi definida. Verifique seu config.php e se há algum erro de sintaxe que o impeça de ser carregado.</p>";
    error_log('Teste de DB - $pdo não definido.');
}

if (defined('BASE_URL')) {
    echo "<p>BASE_URL está definida: <strong>" . htmlspecialchars(BASE_URL) . "</strong></p>";
} else {
    echo "<p style='color: red;'>Erro: BASE_URL não está definida. O config.php pode não ter sido carregado corretamente ou há um erro de sintaxe anterior.</p>";
    error_log('Teste de DB - BASE_URL não definida.');
}

echo "<p>Verifique também os logs de erro do PHP no seu cPanel para mais detalhes.</p>";
?>