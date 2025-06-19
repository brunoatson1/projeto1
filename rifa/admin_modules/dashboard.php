<?php
// Este arquivo Ã© incluÃ­do por admin.php, entÃ£o jÃ¡ tem acesso a $pdo e $_SESSION.
// NÃ£o precisa de includes/header.php ou includes/auth_check.php aqui.

// FunÃ§Ã£o para obter contagem de itens do cardÃ¡pio
function getContagemItensCardapio($pdo) {
    try {
        $stmt = $pdo->query("SELECT COUNT(*) FROM itens_cardapio");
        return $stmt->fetchColumn();
    } catch (PDOException $e) {
        error_log("Erro ao contar itens do cardÃ¡pio: " . $e->getMessage());
        return 0; // Retorna 0 em caso de erro
    }
}

// FunÃ§Ã£o para obter contagem de atendentes
function getContagemAtendentes($pdo) {
    try {
        $stmt = $pdo->query("SELECT COUNT(*) FROM usuarios WHERE tipo = 'atendente'");
        return $stmt->fetchColumn();
    } catch (PDOException $e) {
        error_log("Erro ao contar atendentes: " . $e->getMessage());
        return 0; // Retorna 0 em caso de erro
    }
}

// ObtÃ©m os dados
$totalItensCardapio = getContagemItensCardapio($pdo);
$totalAtendentes = getContagemAtendentes($pdo);

?>

<div class="alert alert-info" role="alert">
    Bem-vindo ao Painel de Administração! Aqui você pode gerenciar o cardápio, atendentes e muito mais.
</div>

<div class="row">
    <div class="col-md-4 mb-4">
        <div class="card text-center shadow-sm">
            <div class="card-body">
                <h5 class="card-title text-primary"><i class="bi bi-book me-2"></i>Itens no Cardápio</h5>
                <p class="card-text display-4 text-primary"><?php echo $totalItensCardapio; ?></p>
                <a href="admin.php?section=cardapio" class="btn btn-outline-primary">Gerenciar Cardápio</a>
            </div>
        </div>
    </div>
    <div class="col-md-4 mb-4">
        <div class="card text-center shadow-sm">
            <div class="card-body">
                <h5 class="card-title text-success"><i class="bi bi-people me-2"></i>Atendentes Cadastrados</h5>
                <p class="card-text display-4 text-success"><?php echo $totalAtendentes; ?></p>
                <a href="admin.php?section=atendentes" class="btn btn-outline-success">Gerenciar Atendentes</a>
            </div>
        </div>
    </div>
    <div class="col-md-4 mb-4">
        <div class="card text-center shadow-sm">
            <div class="card-body">
                <h5 class="card-title text-info"><i class="bi bi-receipt me-2"></i>Pedidos Finalizados (Hoje)</h5>
                <p class="card-text display-4 text-info">--</p> <a href="#" class="btn btn-outline-info disabled">Ver Relatórios</a>
            </div>
        </div>
    </div>
</div>

<div class="row mt-4">
    <div class="col-md-12">
        <div class="card shadow-sm">
            <div class="card-header bg-light">
                <h5 class="mb-0">Atividades Recentes</h5>
            </div>
            <div class="card-body">
                <p>Nenhuma atividade recente para exibir.</p>
                </div>
        </div>
    </div>
</div>