<?php
header('Content-Type: application/json'); // Garante que a resposta será JSON

// Inclua a conexão com o banco de dados
// Caminho relativo a api/admin.php para config.php
require_once '../config.php';

// Inicia a sessão (se ainda não estiver iniciada) e verifica autenticação
// É crucial que auth_check.php defina $_SESSION['user_tipo']
// Já que config.php já inclui auth_check.php, não é necessário chamar session_start() ou auth_check.php aqui novamente
// Apenas garanta que as variáveis de sessão estejam acessíveis.
// Se você está chamando session_start() em config.php, não chame aqui novamente.
// Se não, adicione:
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}


// Verifica se o usuário está logado e se é um administrador
if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Acesso negado. Usuário não autorizado ou não logado.']);
    exit;
}

// Obtém o método da requisição (GET ou POST)
$method = $_SERVER['REQUEST_METHOD'];

// Lida com requisições GET
if ($method === 'GET') {
    $action = $_GET['action'] ?? '';

    switch ($action) {
        case 'get_categorias':
            try {
                $stmt = $pdo->query("SELECT id, nome FROM categorias_cardapio ORDER BY nome ASC");
                $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'data' => $categorias]);
            } catch (PDOException $e) {
                error_log("Erro GET get_categorias: " . $e->getMessage());
                echo json_encode(['success' => false, 'message' => 'Erro ao buscar categorias: ' . $e->getMessage()]);
            }
            break;

        case 'get_itens_cardapio':
            $typeFilter = $_GET['type'] ?? '';
            try {
                $sql = "SELECT ic.id, ic.nome, ic.descricao, ic.preco, ic.tipo, ic.id_categoria, cc.nome AS categoria_nome
                                FROM itens_cardapio ic
                                LEFT JOIN categorias_cardapio cc ON ic.id_categoria = cc.id";
                $params = [];

                if ($typeFilter === 'prato_bebida') {
                    $sql .= " WHERE ic.tipo IN ('prato', 'bebida')";
                } elseif ($typeFilter === 'sabor') {
                    $sql .= " WHERE ic.tipo = 'sabor'";
                } elseif ($typeFilter === 'adicional') {
                    $sql .= " WHERE ic.tipo = 'adicional'";
                } elseif ($typeFilter === 'sabor_adicional') {
                    $sql .= " WHERE ic.tipo IN ('sabor', 'adicional')";
                }
                
                $sql .= " ORDER BY ic.nome ASC";

                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $itens = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'data' => $itens]);
            } catch (PDOException $e) {
                error_log("Erro GET get_itens_cardapio: " . $e->getMessage());
                echo json_encode(['success' => false, 'message' => 'Erro ao buscar itens do cardápio: ' . $e->getMessage()]);
            }
            break;
            
        case 'get_prato_sabores':
            $prato_id = $_GET['prato_id'] ?? null;
            if (!$prato_id) {
                echo json_encode(['success' => false, 'message' => 'ID do prato não fornecido.']);
                exit;
            }
            try {
                $stmt = $pdo->prepare("SELECT ps.id_prato, ps.id_sabor, ps.preco_adicional, ic.nome AS sabor_nome
                                            FROM pratos_sabores ps
                                            JOIN itens_cardapio ic ON ps.id_sabor = ic.id
                                            WHERE ps.id_prato = :prato_id ORDER BY ic.nome ASC");
                $stmt->execute([':prato_id' => $prato_id]);
                $assocs = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'data' => $assocs]);
            } catch (PDOException $e) {
                error_log("Erro GET get_prato_sabores: " . $e->getMessage());
                echo json_encode(['success' => false, 'message' => 'Erro ao buscar sabores do prato: ' . $e->getMessage()]);
            }
            break;

        case 'get_prato_adicionais':
            $prato_id = $_GET['prato_id'] ?? null;
            if (!$prato_id) {
                echo json_encode(['success' => false, 'message' => 'ID do prato não fornecido.']);
                exit;
            }
            try {
                $stmt = $pdo->prepare("SELECT pa.id_prato, pa.id_adicional, pa.preco_adicional, ic.nome AS adicional_nome
                                            FROM pratos_adicionais pa
                                            JOIN itens_cardapio ic ON pa.id_adicional = ic.id
                                            WHERE pa.id_prato = :prato_id ORDER BY ic.nome ASC");
                $stmt->execute([':prato_id' => $prato_id]);
                $assocs = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'data' => $assocs]);
            } catch (PDOException $e) {
                error_log("Erro GET get_prato_adicionais: " . $e->getMessage());
                echo json_encode(['success' => false, 'message' => 'Erro ao buscar adicionais do prato: ' . $e->getMessage()]);
            }
            break;

        case 'get_atendentes':
            try {
                // Selecione 'login' como 'nome_usuario' para compatibilidade com o frontend
                // E inclua 'nome_completo'
                $stmt = $pdo->query("SELECT id, login AS nome_usuario, nome_completo, senha, tipo FROM usuarios WHERE tipo = 'atendente' ORDER BY nome_completo ASC");
                $atendentes = $stmt->fetchAll(PDO::FETCH_ASSOC);
                // NUNCA retorne a senha em texto claro, mesmo que seja hash!
                // Remova o campo senha antes de enviar para o cliente.
                foreach ($atendentes as &$atendente) {
                    unset($atendente['senha']);
                }
                echo json_encode(['success' => true, 'data' => $atendentes]);
            } catch (PDOException $e) {
                error_log("Erro GET get_atendentes: " . $e->getMessage());
                echo json_encode(['success' => false, 'message' => 'Erro ao buscar atendentes: ' . $e->getMessage()]);
            }
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Ação GET desconhecida.']);
            break;
    }
    exit;
}

// Lida com requisições POST
if ($method === 'POST') {
    // Pega o corpo da requisição JSON
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    $action = $data['action'] ?? '';

    switch ($action) {
        // --- Operações de Categorias ---
        case 'add_categoria':
            $nome = $data['nome'] ?? '';
            if (empty($nome)) {
                echo json_encode(['success' => false, 'message' => 'Nome da categoria é obrigatório.']);
                exit;
            }
            try {
                $stmt = $pdo->prepare("INSERT INTO categorias_cardapio (nome) VALUES (:nome)");
                $stmt->execute([':nome' => $nome]);
                echo json_encode(['success' => true, 'message' => 'Categoria adicionada com sucesso!', 'id' => $pdo->lastInsertId()]);
            } catch (PDOException $e) {
                // Erro de duplicidade de nome (se houver UNIQUE constraint) ou outro erro
                error_log("Erro POST add_categoria: " . $e->getMessage());
                echo json_encode(['success' => false, 'message' => 'Erro ao adicionar categoria: ' . $e->getMessage()]);
            }
            break;

        case 'update_categoria':
            $id = $data['id'] ?? null;
            $nome = $data['nome'] ?? '';
            if (empty($id) || empty($nome)) {
                echo json_encode(['success' => false, 'message' => 'ID e nome da categoria são obrigatórios para atualização.']);
                exit;
            }
            try {
                $stmt = $pdo->prepare("UPDATE categorias_cardapio SET nome = :nome WHERE id = :id");
                $stmt->execute([':nome' => $nome, ':id' => $id]);
                if ($stmt->rowCount()) {
                    echo json_encode(['success' => true, 'message' => 'Categoria atualizada com sucesso!']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Categoria não encontrada ou nenhum dado alterado.']);
                }
            } catch (PDOException $e) {
                error_log("Erro POST update_categoria: " . $e->getMessage());
                echo json_encode(['success' => false, 'message' => 'Erro ao atualizar categoria: ' . $e->getMessage()]);
            }
            break;

        case 'delete_categoria':
            $id = $data['id'] ?? null;
            if (empty($id)) {
                echo json_encode(['success' => false, 'message' => 'ID da categoria é obrigatório para exclusão.']);
                exit;
            }
            try {
                // Antes de excluir a categoria, você deve lidar com os itens_cardapio que a referenciam.
                // Opções:
                // 1. Setar id_categoria para NULL nos itens_cardapio que usavam essa categoria.
                // 2. Excluir os itens_cardapio relacionados (CUIDADO!).
                // A melhor prática é setar NULL ou impedir a exclusão se houver referências.
                // Por simplicidade, vamos setar para NULL aqui:
                $pdo->beginTransaction();
                $stmtUpdate = $pdo->prepare("UPDATE itens_cardapio SET id_categoria = NULL WHERE id_categoria = :id");
                $stmtUpdate->execute([':id' => $id]);

                $stmtDelete = $pdo->prepare("DELETE FROM categorias_cardapio WHERE id = :id");
                $stmtDelete->execute([':id' => $id]);
                
                $pdo->commit();

                if ($stmtDelete->rowCount()) {
                    echo json_encode(['success' => true, 'message' => 'Categoria e suas referências em itens do cardápio foram removidas com sucesso!']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Categoria não encontrada.']);
                }
            } catch (PDOException $e) {
                $pdo->rollBack();
                error_log("Erro POST delete_categoria: " . $e->getMessage());
                echo json_encode(['success' => false, 'message' => 'Erro ao excluir categoria: ' . $e->getMessage()]);
            }
            break;

        // --- Operações de Itens do Cardápio (Pratos, Bebidas, Sabores, Adicionais) ---
        case 'add_item_cardapio':
            $nome = $data['nome'] ?? '';
            $descricao = $data['descricao'] ?? null;
            $preco = $data['preco'] ?? 0;
            $id_categoria = $data['id_categoria'] ?? null;
            $tipo = $data['tipo'] ?? 'prato'; // Padrão 'prato'

            if (empty($nome)) {
                echo json_encode(['success' => false, 'message' => 'Nome do item é obrigatório.']);
                exit;
            }
            if (!in_array($tipo, ['prato', 'bebida', 'sabor', 'adicional'])) {
                echo json_encode(['success' => false, 'message' => 'Tipo de item inválido.']);
                exit;
            }

            try {
                $stmt = $pdo->prepare("INSERT INTO itens_cardapio (nome, descricao, preco, id_categoria, tipo) VALUES (:nome, :descricao, :preco, :id_categoria, :tipo)");
                $stmt->execute([
                    ':nome' => $nome,
                    ':descricao' => $descricao,
                    ':preco' => $preco,
                    ':id_categoria' => $id_categoria,
                    ':tipo' => $tipo
                ]);
                echo json_encode(['success' => true, 'message' => 'Item do cardápio adicionado com sucesso!', 'id' => $pdo->lastInsertId()]);
            } catch (PDOException $e) {
                error_log("Erro POST add_item_cardapio: " . $e->getMessage());
                echo json_encode(['success' => false, 'message' => 'Erro ao adicionar item do cardápio: ' . $e->getMessage()]);
            }
            break;

        case 'update_item_cardapio':
            $id = $data['id'] ?? null;
            $nome = $data['nome'] ?? '';
            $descricao = $data['descricao'] ?? null;
            $preco = $data['preco'] ?? 0;
            $id_categoria = $data['id_categoria'] ?? null;
            $tipo = $data['tipo'] ?? 'prato';

            if (empty($id) || empty($nome)) {
                echo json_encode(['success' => false, 'message' => 'ID e nome do item são obrigatórios para atualização.']);
                exit;
            }
            if (!in_array($tipo, ['prato', 'bebida', 'sabor', 'adicional'])) {
                echo json_encode(['success' => false, 'message' => 'Tipo de item inválido.']);
                exit;
            }

            try {
                $stmt = $pdo->prepare("UPDATE itens_cardapio SET nome = :nome, descricao = :descricao, preco = :preco, id_categoria = :id_categoria, tipo = :tipo WHERE id = :id");
                $stmt->execute([
                    ':nome' => $nome,
                    ':descricao' => $descricao,
                    ':preco' => $preco,
                    ':id_categoria' => $id_categoria,
                    ':tipo' => $tipo,
                    ':id' => $id
                ]);
                if ($stmt->rowCount()) {
                    echo json_encode(['success' => true, 'message' => 'Item do cardápio atualizado com sucesso!']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Item do cardápio não encontrado ou nenhum dado alterado.']);
                }
            } catch (PDOException $e) {
                error_log("Erro POST update_item_cardapio: " . $e->getMessage());
                echo json_encode(['success' => false, 'message' => 'Erro ao atualizar item do cardápio: ' . $e->getMessage()]);
            }
            break;

        case 'delete_item_cardapio':
            $id = $data['id'] ?? null;
            if (empty($id)) {
                echo json_encode(['success' => false, 'message' => 'ID do item é obrigatório para exclusão.']);
                exit;
            }
            try {
                // Antes de excluir um item do cardápio, lide com suas associações
                // Exclua as referências em pratos_sabores e pratos_adicionais primeiro
                $pdo->beginTransaction();

                // Delete de pratos_sabores onde este item é o sabor
                $stmtSabores = $pdo->prepare("DELETE FROM pratos_sabores WHERE id_sabor = :id");
                $stmtSabores->execute([':id' => $id]);

                // Delete de pratos_adicionais onde este item é o adicional
                $stmtAdicionais = $pdo->prepare("DELETE FROM pratos_adicionais WHERE id_adicional = :id");
                $stmtAdicionais->execute([':id' => $id]);

                // Agora pode excluir o item principal
                $stmtDelete = $pdo->prepare("DELETE FROM itens_cardapio WHERE id = :id");
                $stmtDelete->execute([':id' => $id]);
                
                $pdo->commit();

                if ($stmtDelete->rowCount()) {
                    echo json_encode(['success' => true, 'message' => 'Item do cardápio e suas associações foram removidos com sucesso!']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Item do cardápio não encontrado.']);
                }
            } catch (PDOException $e) {
                $pdo->rollBack();
                error_log("Erro POST delete_item_cardapio: " . $e->getMessage());
                echo json_encode(['success' => false, 'message' => 'Erro ao excluir item do cardápio: ' . $e->getMessage()]);
            }
            break;

        // --- Operações de Associação de Sabores/Adicionais a Pratos ---
        case 'associate_prato_sabor':
            $prato_id = $data['prato_id'] ?? null;
            $sabor_id = $data['sabor_id'] ?? null;
            $preco_adicional = $data['preco_adicional'] ?? 0;

            if (empty($prato_id) || empty($sabor_id)) {
                echo json_encode(['success' => false, 'message' => 'IDs de prato e sabor são obrigatórios para associação.']);
                exit;
            }
            try {
                // Verifica se a associação já existe
                $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM pratos_sabores WHERE id_prato = :prato_id AND id_sabor = :sabor_id");
                $stmtCheck->execute([':prato_id' => $prato_id, ':sabor_id' => $sabor_id]);
                if ($stmtCheck->fetchColumn() > 0) {
                    echo json_encode(['success' => false, 'message' => 'Este sabor já está associado a este prato.']);
                    exit;
                }

                $stmt = $pdo->prepare("INSERT INTO pratos_sabores (id_prato, id_sabor, preco_adicional) VALUES (:id_prato, :id_sabor, :preco_adicional)");
                $stmt->execute([
                    ':id_prato' => $prato_id,
                    ':id_sabor' => $sabor_id,
                    ':preco_adicional' => $preco_adicional
                ]);
                echo json_encode(['success' => true, 'message' => 'Sabor associado ao prato com sucesso!']);
            } catch (PDOException $e) {
                error_log("Erro POST associate_prato_sabor: " . $e->getMessage());
                echo json_encode(['success' => false, 'message' => 'Erro ao associar sabor: ' . $e->getMessage()]);
            }
            break;

        case 'remove_prato_sabor':
            $prato_id = $data['prato_id'] ?? null;
            $sabor_id = $data['sabor_id'] ?? null;

            if (empty($prato_id) || empty($sabor_id)) {
                echo json_encode(['success' => false, 'message' => 'IDs de prato e sabor são obrigatórios para remover associação.']);
                exit;
            }
            try {
                $stmt = $pdo->prepare("DELETE FROM pratos_sabores WHERE id_prato = :id_prato AND id_sabor = :id_sabor");
                $stmt->execute([':id_prato' => $prato_id, ':id_sabor' => $sabor_id]);
                if ($stmt->rowCount()) {
                    echo json_encode(['success' => true, 'message' => 'Associação de sabor removida com sucesso!']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Associação não encontrada.']);
                }
            } catch (PDOException $e) {
                error_log("Erro POST remove_prato_sabor: " . $e->getMessage());
                echo json_encode(['success' => false, 'message' => 'Erro ao remover associação de sabor: ' . $e->getMessage()]);
            }
            break;

        case 'associate_prato_adicional':
            $prato_id = $data['prato_id'] ?? null;
            $adicional_id = $data['adicional_id'] ?? null;
            $preco_adicional = $data['preco_adicional'] ?? 0;

            if (empty($prato_id) || empty($adicional_id)) {
                echo json_encode(['success' => false, 'message' => 'IDs de prato e adicional são obrigatórios para associação.']);
                exit;
            }
            try {
                // Verifica se a associação já existe
                $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM pratos_adicionais WHERE id_prato = :prato_id AND id_adicional = :adicional_id");
                $stmtCheck->execute([':prato_id' => $prato_id, ':adicional_id' => $adicional_id]);
                if ($stmtCheck->fetchColumn() > 0) {
                    echo json_encode(['success' => false, 'message' => 'Este adicional já está associado a este prato.']);
                    exit;
                }

                $stmt = $pdo->prepare("INSERT INTO pratos_adicionais (id_prato, id_adicional, preco_adicional) VALUES (:id_prato, :id_adicional, :preco_adicional)");
                $stmt->execute([
                    ':id_prato' => $prato_id,
                    ':id_adicional' => $adicional_id,
                    ':preco_adicional' => $preco_adicional
                ]);
                echo json_encode(['success' => true, 'message' => 'Adicional associado ao prato com sucesso!']);
            } catch (PDOException $e) {
                error_log("Erro POST associate_prato_adicional: " . $e->getMessage());
                echo json_encode(['success' => false, 'message' => 'Erro ao associar adicional: ' . $e->getMessage()]);
            }
            break;

        case 'remove_prato_adicional':
            $prato_id = $data['prato_id'] ?? null;
            $adicional_id = $data['adicional_id'] ?? null;

            if (empty($prato_id) || empty($adicional_id)) {
                echo json_encode(['success' => false, 'message' => 'IDs de prato e adicional são obrigatórios para remover associação.']);
                exit;
            }
            try {
                $stmt = $pdo->prepare("DELETE FROM pratos_adicionais WHERE id_prato = :id_prato AND id_adicional = :id_adicional");
                $stmt->execute([':id_prato' => $prato_id, ':id_adicional' => $adicional_id]);
                if ($stmt->rowCount()) {
                    echo json_encode(['success' => true, 'message' => 'Associação de adicional removida com sucesso!']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Associação não encontrada.']);
                }
            } catch (PDOException $e) {
                error_log("Erro POST remove_prato_adicional: " . $e->getMessage());
                echo json_encode(['success' => false, 'message' => 'Erro ao remover associação de adicional: ' . $e->getMessage()]);
            }
            break;

        // --- Operações de Atendentes (Usuários tipo 'atendente') ---
        case 'add_atendente':
            // 'nome_usuario' no JS corresponde a 'login' no banco de dados
            $login_usuario = $data['nome_usuario'] ?? '';
            $nome_completo = $data['nome_completo'] ?? '';
            $senha = $data['senha'] ?? '';

            if (empty($login_usuario) || empty($nome_completo) || empty($senha)) {
                echo json_encode(['success' => false, 'message' => 'Todos os campos são obrigatórios para adicionar atendente.']);
                exit;
            }

            // Hash da senha (importante!)
            $senha_hash = password_hash($senha, PASSWORD_DEFAULT);

            try {
                // Verificar se login (nome de usuario) já existe
                $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM usuarios WHERE login = :login_usuario");
                $stmtCheck->execute([':login_usuario' => $login_usuario]);
                if ($stmtCheck->fetchColumn() > 0) {
                    echo json_encode(['success' => false, 'message' => 'Nome de usuário (login) já existe. Escolha outro.']);
                    exit;
                }

                // Inserir usando 'login' e 'nome_completo'
                $stmt = $pdo->prepare("INSERT INTO usuarios (login, nome_completo, senha, tipo) VALUES (:login_usuario, :nome_completo, :senha, 'atendente')");
                $stmt->execute([
                    ':login_usuario' => $login_usuario,
                    ':nome_completo' => $nome_completo,
                    ':senha' => $senha_hash
                ]);
                echo json_encode(['success' => true, 'message' => 'Atendente adicionado com sucesso!', 'id' => $pdo->lastInsertId()]);
            } catch (PDOException $e) {
                error_log("Erro POST add_atendente: " . $e->getMessage());
                echo json_encode(['success' => false, 'message' => 'Erro ao adicionar atendente: ' . $e->getMessage()]);
            }
            break;

        case 'update_atendente':
            $id = $data['id'] ?? null;
            // 'nome_usuario' no JS corresponde a 'login' no banco de dados
            $login_usuario = $data['nome_usuario'] ?? '';
            $nome_completo = $data['nome_completo'] ?? '';
            $senha = $data['senha'] ?? ''; // Senha pode ser vazia se não for alterada

            if (empty($id) || empty($login_usuario) || empty($nome_completo)) {
                echo json_encode(['success' => false, 'message' => 'ID, nome de usuário (login) e nome completo são obrigatórios para atualização de atendente.']);
                exit;
            }

            try {
                // Verificar se login (nome de usuario) já existe para outro ID
                $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM usuarios WHERE login = :login_usuario AND id != :id");
                $stmtCheck->execute([':login_usuario' => $login_usuario, ':id' => $id]);
                if ($stmtCheck->fetchColumn() > 0) {
                    echo json_encode(['success' => false, 'message' => 'Nome de usuário (login) já existe para outro atendente.']);
                    exit;
                }

                $sql = "UPDATE usuarios SET login = :login_usuario, nome_completo = :nome_completo";
                $params = [
                    ':login_usuario' => $login_usuario,
                    ':nome_completo' => $nome_completo,
                    ':id' => $id
                ];

                if (!empty($senha)) {
                    $senha_hash = password_hash($senha, PASSWORD_DEFAULT);
                    $sql .= ", senha = :senha";
                    $params[':senha'] = $senha_hash;
                }

                $sql .= " WHERE id = :id AND tipo = 'atendente'"; // Garante que só atualiza atendentes

                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);

                if ($stmt->rowCount()) {
                    echo json_encode(['success' => true, 'message' => 'Atendente atualizado com sucesso!']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Atendente não encontrado ou nenhum dado alterado.']);
                }
            } catch (PDOException $e) {
                error_log("Erro POST update_atendente: " . $e->getMessage());
                echo json_encode(['success' => false, 'message' => 'Erro ao atualizar atendente: ' . $e->getMessage()]);
            }
            break;

        case 'delete_atendente':
            $id = $data['id'] ?? null;
            if (empty($id)) {
                echo json_encode(['success' => false, 'message' => 'ID do atendente é obrigatório para exclusão.']);
                exit;
            }
            try {
                // VERIFICAÇÃO DE PEDIDOS ASSOCIADOS
                // Verifica se existem pedidos na tabela 'pedidos' onde 'id_atendente' é igual ao ID do atendente que queremos excluir.
                $stmtCheckPedidos = $pdo->prepare("SELECT COUNT(*) FROM pedidos WHERE id_atendente = :id");
                $stmtCheckPedidos->execute([':id' => $id]);
                
                // Se o COUNT(*) for maior que 0, significa que existem pedidos associados.
                if ($stmtCheckPedidos->fetchColumn() > 0) {
                    echo json_encode(['success' => false, 'message' => 'Não é possível excluir o atendente: existem pedidos associados a ele.']);
                    exit; // Impede a exclusão e retorna a mensagem de erro.
                }

                // Se não houver pedidos associados, procede com a exclusão.
                $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = :id AND tipo = 'atendente'");
                $stmt->execute([':id' => $id]);
                if ($stmt->rowCount()) {
                    echo json_encode(['success' => true, 'message' => 'Atendente excluído com sucesso!']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Atendente não encontrado.']);
                }
            } catch (PDOException $e) {
                // Captura qualquer outro erro inesperado do banco de dados.
                error_log("Erro POST delete_atendente: " . $e->getMessage());
                echo json_encode(['success' => false, 'message' => 'Erro ao excluir atendente: ' . $e->getMessage()]);
            }
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Ação POST desconhecida.']);
            break;
    }
    exit;
}

// Se o método da requisição não for GET nem POST
echo json_encode(['success' => false, 'message' => 'Método de requisição não suportado.']);
exit;
?>