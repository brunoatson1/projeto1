<?php
require_once '../config.php';
require_once '../includes/auth_check.php';

header('Content-Type: application/json');

try {
    // Buscar categorias
    $categorias_stmt = $pdo->query("SELECT * FROM categorias_cardapio ORDER BY nome ASC");
    $categorias = $categorias_stmt->fetchAll(PDO::FETCH_ASSOC);

    // Para cada categoria, buscar os itens
    $cardapio_completo = [];
    foreach ($categorias as $categoria) {
        $itens_stmt = $pdo->prepare("SELECT id, nome, descricao, preco FROM itens_cardapio WHERE id_categoria = ? AND disponivel = 1 ORDER BY nome ASC");
        $itens_stmt->execute([$categoria['id']]);
        $itens = $itens_stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($itens) {
            $categoria['itens'] = $itens;
            $cardapio_completo[] = $categoria;
        }
    }

    echo json_encode($cardapio_completo);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao buscar o cardápio: ' . $e->getMessage()]);
}
?>