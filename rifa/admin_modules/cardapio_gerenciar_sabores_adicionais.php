<?php
// Este arquivo é incluído por cardapio_gerenciar_pratos.php, que por sua vez é incluído por admin.php.
// EntÃ£o, ele jÃ¡ tem acesso ao objeto $pdo e Ã  sessÃ£o do usuÃ¡rio.

// Para o formulário de cadastro/edição, precisaremos das categorias cadastradas (se quiser categorizar sabores/adicionais)
// e dos pratos principais para associar.
$categorias = []; // Você pode optar por categorizar sabores/adicionais ou não.
try {
    $stmt = $pdo->query("SELECT id, nome FROM categorias_cardapio ORDER BY nome ASC");
    $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    error_log("Erro ao carregar categorias para o formulário de sabores/adicionais: " . $e->getMessage());
}

$pratosBase = []; // Pratos que podem ter sabores ou adicionais (ex: Pizzas, Lanches)
try {
    // Buscamos apenas os itens que são do tipo 'prato' e não 'sabor' ou 'adicional'
    $stmt = $pdo->query("SELECT id, nome FROM itens_cardapio WHERE tipo = 'prato' ORDER BY nome ASC");
    $pratosBase = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    error_log("Erro ao carregar pratos base para sabores/adicionais: " . $e->getMessage());
}

?>

<div class="mb-3">
    <button type="button" class="btn btn-primary me-2" data-bs-toggle="modal" data-bs-target="#saborAdicionalModal" id="addSaborAdicionalBtn">
        <i class="bi bi-plus-circle me-2"></i>Adicionar Sabor/Adicional
    </button>
</div>

<div class="table-responsive mb-4">
    <h5 class="mt-4 mb-3">Lista de Sabores e Adicionais</h5>
    <table class="table table-hover table-striped" id="saboresAdicionaisTable">
        <thead>
            <tr>
                <th scope="col">ID</th>
                <th scope="col">Nome</th>
                <th scope="col">Preço (Base)</th>
                <th scope="col">Tipo</th>
                <th scope="col">Ações</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td colspan="5" class="text-center">Carregando sabores/adicionais...</td>
            </tr>
        </tbody>
    </table>
</div>

<div class="mb-3 mt-5">
    <h5 class="mb-3">Associação de Sabores a Pratos</h5>
    <div class="row">
        <div class="col-md-6">
            <label for="selectPratoSabor" class="form-label">Selecionar Prato Principal (Ex: Pizza Grande)</label>
            <select class="form-select" id="selectPratoSabor">
                <option value="">Selecione um prato...</option>
                <?php foreach ($pratosBase as $prato): ?>
                    <option value="<?php echo $prato['id']; ?>"><?php echo htmlspecialchars($prato['nome']); ?></option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="col-md-6">
            <label for="selectSabor" class="form-label">Selecionar Sabor</label>
            <select class="form-select" id="selectSabor">
                <option value="">Carregando sabores...</option>
            </select>
        </div>
    </div>
    <div class="mb-3 mt-3">
        <label for="precoAdicionalSabor" class="form-label">Preço Adicional do Sabor (Opcional)</label>
        <input type="number" step="0.01" class="form-control" id="precoAdicionalSabor" placeholder="0.00">
    </div>
    <button type="button" class="btn btn-secondary mt-2" id="associateSaborBtn">
        <i class="bi bi-link-45deg me-2"></i>Associar Sabor ao Prato
    </button>
</div>

<div class="table-responsive mt-4">
    <h5 class="mb-3">Sabores Associados ao Prato Selecionado</h5>
    <table class="table table-sm table-bordered" id="pratoSaboresTable">
        <thead>
            <tr>
                <th scope="col">Sabor</th>
                <th scope="col">Preço Adicional</th>
                <th scope="col">Ações</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td colspan="3" class="text-center">Selecione um prato para ver os sabores associados.</td>
            </tr>
        </tbody>
    </table>
</div>

<hr class="my-5">

<div class="mb-3">
    <h5 class="mb-3">Associação de Adicionais a Pratos</h5>
    <div class="row">
        <div class="col-md-6">
            <label for="selectPratoAdicional" class="form-label">Selecionar Prato Principal</label>
            <select class="form-select" id="selectPratoAdicional">
                <option value="">Selecione um prato...</option>
                <?php foreach ($pratosBase as $prato): ?>
                    <option value="<?php echo $prato['id']; ?>"><?php echo htmlspecialchars($prato['nome']); ?></option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="col-md-6">
            <label for="selectAdicional" class="form-label">Selecionar Adicional</label>
            <select class="form-select" id="selectAdicional">
                <option value="">Carregando adicionais...</option>
            </select>
        </div>
    </div>
    <div class="mb-3 mt-3">
        <label for="precoAdicionalAdicional" class="form-label">Preço do Adicional</label>
        <input type="number" step="0.01" class="form-control" id="precoAdicionalAdicional" placeholder="0.00" required>
    </div>
    <button type="button" class="btn btn-secondary mt-2" id="associateAdicionalBtn">
        <i class="bi bi-link-45deg me-2"></i>Associar Adicional ao Prato
    </button>
</div>

<div class="table-responsive mt-4">
    <h5 class="mb-3">Adicionais Associados ao Prato Selecionado</h5>
    <table class="table table-sm table-bordered" id="pratoAdicionaisTable">
        <thead>
            <tr>
                <th scope="col">Adicional</th>
                <th scope="col">Preço do Adicional</th>
                <th scope="col">Ações</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td colspan="3" class="text-center">Selecione um prato para ver os adicionais associados.</td>
            </tr>
        </tbody>
    </table>
</div>


<div class="modal fade" id="saborAdicionalModal" tabindex="-1" aria-labelledby="saborAdicionalModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="saborAdicionalModalLabel">Adicionar Novo Sabor/Adicional</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                <form id="saborAdicionalForm">
                    <input type="hidden" id="saborAdicionalId" name="id">
                    <div class="mb-3">
                        <label for="saborAdicionalNome" class="form-label">Nome</label>
                        <input type="text" class="form-control" id="saborAdicionalNome" name="nome" required>
                    </div>
                    <div class="mb-3">
                        <label for="saborAdicionalPreco" class="form-label">Preço Base (R$)</label>
                        <input type="number" step="0.01" class="form-control" id="saborAdicionalPreco" name="preco" value="0.00" required>
                        <small class="form-text text-muted">Preço base do item. O adicional por prato é definido abaixo.</small>
                    </div>
                    <div class="mb-3">
                        <label for="saborAdicionalTipo" class="form-label">Tipo</label>
                        <select class="form-select" id="saborAdicionalTipo" name="tipo" required>
                            <option value="sabor">Sabor</option>
                            <option value="adicional">Adicional</option>
                        </select>
                    </div>
                    </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                <button type="submit" form="saborAdicionalForm" class="btn btn-primary" id="saveSaborAdicionalBtn">Salvar</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="confirmDeleteSaborAdicionalModal" tabindex="-1" aria-labelledby="confirmDeleteSaborAdicionalModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="confirmDeleteSaborAdicionalModalLabel">Confirmar Exclusão</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                Tem certeza que deseja excluir "<strong id="saborAdicionalNomeExcluir"></strong>"?
                Isso também removerá quaisquer associações a pratos.
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-danger" id="confirmDeleteSaborAdicionalBtn">Excluir</button>
            </div>
        </div>
    </div>
</div>

