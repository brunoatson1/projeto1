<?php 
require_once 'config.php';
// Se o usuário já estiver logado, redireciona
if (isset($_SESSION['user_id'])) {
    $redirect_url = ($_SESSION['user_tipo'] === 'cozinha') ? 'cozinha.php' : 'atendente.php';
    header('Location: ' . BASE_URL . $redirect_url);
    exit;
}
$page_title = 'Login'; // Define o título da página
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $page_title; ?></title>
    <link href="assets/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: #f8f9fa;
        }
        .login-card {
            width: 100%;
            max-width: 400px;
        }
    </style>
</head>
<body>
    <div class="card login-card shadow-sm">
        <div class="card-body p-5">
            <h3 class="card-title text-center mb-4">Acesso ao Sistema</h3>
            <div id="alertContainer"></div>
            <form id="loginForm">
                <div class="mb-3">
                    <label for="login" class="form-label">Usuário</label>
                    <input type="text" class="form-control" id="login" name="login" required>
                </div>
                <div class="mb-3">
                    <label for="senha" class="form-label">Senha</label>
                    <input type="password" class="form-control" id="senha" name="senha" required>
                </div>
                <div class="d-grid">
                    <button type="submit" class="btn btn-primary">Entrar</button>
                </div>
            </form>
        </div>
    </div>
    <script src="assets/js/login.js"></script>
</body>
</html>