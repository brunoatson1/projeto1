<?php
require_once '../config.php';
require_once '../includes/auth_check.php'; // Garante que s�� usu��rios logados acessem

header('Content-Type: application/json');

try {
    // Consulta para selecionar todas as mesas
    // E, para cada mesa, encontrar o status do pedido N�0�1O FINALIZADO mais recente.
    $sql = "
        SELECT 
            m.id, 
            m.numero, 
            m.status, -- status da mesa (livre/ocupada)
            (SELECT p.status 
             FROM pedidos p 
             WHERE p.id_mesa = m.id 
               AND p.status != 'finalizado' 
             ORDER BY p.data_criacao DESC 
             LIMIT 1) AS status_pedido -- status do pedido mais recente e n�0�0o finalizado
        FROM mesas m
        ORDER BY m.numero ASC
    ";
    
    $stmt = $pdo->query($sql);
    $mesas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($mesas);

} catch (PDOException $e) {
    http_response_code(500);
    // Em produ�0�4�0�0o, �� bom n�0�0o expor e.getMessage() diretamente por seguran�0�4a
    echo json_encode(['error' => 'Erro ao buscar mesas: ' . $e->getMessage()]);
}
?>