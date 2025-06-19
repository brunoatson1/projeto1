<?php
require_once '../config.php';
require_once '../includes/auth_check.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // --- BUSCAR PEDIDOS ---
        if (isset($_GET['id_mesa'])) {
            // Busca pedido ativo de uma mesa específica
            $stmt = $pdo->prepare("SELECT * FROM pedidos WHERE id_mesa = ? AND status != 'finalizado' ORDER BY id DESC LIMIT 1");
            $stmt->execute([$_GET['id_mesa']]);
            $pedido = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($pedido) {
                $itens_stmt = $pdo->prepare("SELECT ip.*, ic.nome, ic.preco FROM itens_pedido ip JOIN itens_cardapio ic ON ip.id_item_cardapio = ic.id WHERE ip.id_pedido = ?");
                $itens_stmt->execute([$pedido['id']]);
                $pedido['itens'] = $itens_stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            echo json_encode($pedido);

        } elseif (isset($_GET['status']) && $_GET['status'] === 'cozinha') {
            // Busca pedidos para a tela da cozinha
            // AQUI: Buscando por 'anotado' para novos pedidos
            $novos_stmt = $pdo->query("SELECT p.*, m.numero as numero_mesa FROM pedidos p JOIN mesas m ON p.id_mesa = m.id WHERE p.status = 'anotado' ORDER BY p.data_criacao ASC");
            $novos = $novos_stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach($novos as &$pedido) {
                $itens_stmt = $pdo->prepare("SELECT ip.quantidade, ip.observacao, ic.nome FROM itens_pedido ip JOIN itens_cardapio ic ON ip.id_item_cardapio = ic.id WHERE ip.id_pedido = ?");
                $itens_stmt->execute([$pedido['id']]);
                $pedido['itens'] = $itens_stmt->fetchAll(PDO::FETCH_ASSOC);
            }

            $preparo_stmt = $pdo->query("SELECT p.*, m.numero as numero_mesa FROM pedidos p JOIN mesas m ON p.id_mesa = m.id WHERE p.status = 'em_preparo' ORDER BY p.data_criacao ASC");
            $em_preparo = $preparo_stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach($em_preparo as &$pedido) {
                $itens_stmt = $pdo->prepare("SELECT ip.quantidade, ip.observacao, ic.nome FROM itens_pedido ip JOIN itens_cardapio ic ON ip.id_item_cardapio = ic.id WHERE ip.id_pedido = ?");
                $itens_stmt->execute([$pedido['id']]);
                $pedido['itens'] = $itens_stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            echo json_encode(['novos' => $novos, 'em_preparo' => $em_preparo]);
        }

    } elseif ($method === 'POST') {
        // --- CRIAR OU ATUALIZAR PEDIDO ---
        $data = json_decode(file_get_contents('php://input'), true);

        // Inicia uma transação para garantir a consistência dos dados
        $pdo->beginTransaction();

        if (isset($data['action'])) { // Ações específicas como atualizar status
            $id_pedido = $data['id_pedido'];
            if ($data['action'] === 'update_status') {
                $stmt = $pdo->prepare("UPDATE pedidos SET status = ? WHERE id = ?");
                $stmt->execute([$data['novo_status'], $id_pedido]);
            } elseif ($data['action'] === 'finalizar') {
                $stmt = $pdo->prepare("UPDATE pedidos SET status = 'finalizado', forma_pagamento = ? WHERE id = ?");
                $stmt->execute([$data['forma_pagamento'], $id_pedido]);
                
                // Libera a mesa
                $stmt_mesa_id = $pdo->prepare("SELECT id_mesa FROM pedidos WHERE id = ?");
                $stmt_mesa_id->execute([$id_pedido]);
                $pedido_info = $stmt_mesa_id->fetch(PDO::FETCH_ASSOC);

                if ($pedido_info && isset($pedido_info['id_mesa'])) {
                    $mesa_stmt = $pdo->prepare("UPDATE mesas SET status = 'livre' WHERE id = ?");
                    $mesa_stmt->execute([$pedido_info['id_mesa']]);
                } else {
                     throw new Exception("ID da mesa não encontrado para o pedido " . $id_pedido);
                }
            }
        } else { // Criar novo pedido
            // 1. Criar o pedido na tabela `pedidos` com status 'anotado'
            $sql_pedido = "INSERT INTO pedidos (id_mesa, id_atendente, nome_cliente, status) VALUES (?, ?, ?, 'anotado')";
            $stmt_pedido = $pdo->prepare($sql_pedido);
            $stmt_pedido->execute([$data['id_mesa'], $_SESSION['user_id'], $data['nome_cliente']]);
            $id_pedido = $pdo->lastInsertId();

            // 2. Atualizar o status da mesa para 'ocupada'
            $stmt_mesa = $pdo->prepare("UPDATE mesas SET status = 'ocupada' WHERE id = ?");
            $stmt_mesa->execute([$data['id_mesa']]);

            // 3. Inserir os itens na tabela `itens_pedido` e calcular o total
            $valor_total = 0;
            $sql_item = "INSERT INTO itens_pedido (id_pedido, id_item_cardapio, quantidade, observacao) VALUES (?, ?, ?, ?)";
            $stmt_item = $pdo->prepare($sql_item);

            foreach ($data['itens'] as $item) {
                $stmt_item->execute([$id_pedido, $item['id_item_cardapio'], $item['quantidade'], $item['observacao'] ?? null]);
                
                // Buscar preco do BD para o id_item_cardapio
                $preco_item_stmt = $pdo->prepare("SELECT preco FROM itens_cardapio WHERE id = ?");
                $preco_item_stmt->execute([$item['id_item_cardapio']]);
                $preco_unitario = $preco_item_stmt->fetchColumn();
                $valor_total += $preco_unitario * $item['quantidade'];
            }

            // 4. Atualizar o valor total no pedido
            $stmt_total = $pdo->prepare("UPDATE pedidos SET valor_total = ? WHERE id = ?");
            $stmt_total->execute([$valor_total, $id_pedido]);
        }

        // Confirma a transação
        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Operação realizada com sucesso.']);
    }

} catch (Exception $e) {
    // Se ocorrer algum erro, desfaz a transação
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>