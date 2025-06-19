<?php
// Inclui o arquivo de configuração do banco de dados (que deve ter $pdo disponível)
require_once '../config.php';

// Define o cabeçalho como JSON, pois este script sempre retornará uma resposta JSON
header('Content-Type: application/json');

// Garante que a requisição seja do tipo POST por segurança
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

// *** MUDANÇA AQUI: LENDO O JSON DO CORPO DA REQUISIÇÃO ***
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true); // Decodifica o JSON em um array associativo

// 1. --- RECEBER OS DADOS DO FORMULÁRIO (VIA JSON DECODIFICADO) ---
// As chaves 'nome_usuario' e 'senha' devem corresponder aos 'name' dos seus inputs HTML
// E agora às chaves do objeto JSON enviado pelo JavaScript
$nome_usuario_digitado = $data['nome_usuario'] ?? '';
$senha_digitada = $data['senha'] ?? '';

// 2. --- VALIDAÇÃO BÁSICA DOS CAMPOS ---
if (empty($nome_usuario_digitado) || empty($senha_digitada)) {
    echo json_encode(['success' => false, 'message' => 'Login e senha são obrigatórios.']);
    exit;
}

try {
    // 3. --- BUSCAR O USUÁRIO NO BANCO DE DADOS (USANDO COLUNA 'nome_usuario') ---
    $stmt = $pdo->prepare("SELECT id, nome_completo, senha_hash, tipo_usuario FROM usuarios WHERE nome_usuario = ?");
    $stmt->execute([$nome_usuario_digitado]);
    $user = $stmt->fetch(PDO::FETCH_OBJ);

    // 4. --- VERIFICAR CREDENCIAIS E SENHA (USANDO COLUNA 'senha_hash') ---
    if ($user && password_verify($senha_digitada, $user->senha_hash)) {
        // Inicia a sessão se ainda não estiver iniciada
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }

        // 5. --- ARMAZENAR DADOS NA SESSÃO ---
        $_SESSION['user_id'] = $user->id;
        $_SESSION['user_nome'] = $user->nome_completo;
        $_SESSION['user_tipo'] = $user->tipo_usuario;
        
        // 6. --- DETERMINAR REDIRECIONAMENTO COM BASE NO TIPO DE USUÁRIO ---
        $redirect_url = 'index.php'; // URL padrão ou fallback

        if ($user->tipo_usuario === 'administrador') {
            $redirect_url = 'admin.php';
        } elseif ($user->tipo_usuario === 'atendente') {
            $redirect_url = 'atendente.php';
        } elseif ($user->tipo_usuario === 'cliente') {
            $redirect_url = 'cliente.php';
        }

        // 7. --- RESPOSTA DE SUCESSO ---
        echo json_encode([
            'success' => true,
            'message' => 'Login realizado com sucesso!',
            'redirect' => BASE_URL . $redirect_url
        ]);

    } else {
        // 8. --- RESPOSTA DE FALHA DE AUTENTICAÇÃO ---
        echo json_encode(['success' => false, 'message' => 'Login ou senha inválidos.']);
    }

} catch (PDOException $e) {
    // 9. --- CAPTURA E REPORTA ERROS DO BANCO DE DADOS ---
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>