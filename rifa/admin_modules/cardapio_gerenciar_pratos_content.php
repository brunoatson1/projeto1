<?php
// Este arquivo é incluído por cardapio_gerenciar_pratos.php, que por sua vez é incluído por admin.php.
// EntÃ£o, ele jÃ¡ tem acesso ao objeto $pdo e Ã  sessÃ£o do usuÃ¡rio.

// Para o formulário de cadastro/edição de pratos, precisaremos das categorias cadastradas
// Vamos buscar as categorias aqui para preencher o select no formulário.
$categorias = [];
try {
    $stmt = $pdo->query("SELECT id, nome FROM categorias_cardapio ORDER BY nome ASC");
    $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    error_log("Erro ao carregar categorias para o formulário de pratos: " . $e->getMessage());
    // Se der erro, as categorias não serão listadas, mas o restante da página funcionará.
}
?>

<div class="mb-3">
    <button type="button" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#itemCardapioModal" id="addItemCardapioBtn">
        <i class="bi bi-plus-circle me-2"></i>Adicionar Prato/Bebida
    </button>
</div>

<div class="table-responsive">
    <table class="table table-hover table-striped" id="itensCardapioTable">
        <thead>
            <tr>
                <th scope="col">ID</th>
                <th scope="col">Nome</th>
                <th scope="col">Descrição</th>
                <th scope="col">Preço</th>
                <th scope="col">Categoria</th>
                <th scope="col">Tipo</th>
                <th scope="col">Ações</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td colspan="7" class="text-center">Carregando itens do cardápio...</td>
            </tr>
        </tbody>
    </table>
</div>

<div class="modal fade" id="itemCardapioModal" tabindex="-1" aria-labelledby="itemCardapioModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="itemCardapioModalLabel">Adicionar Novo Item ao Cardápio</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                <form id="itemCardapioForm">
                    <input type="hidden" id="itemId" name="id">
                    <div class="mb-3">
                        <label for="itemNome" class="form-label">Nome do Item</label>
                        <input type="text" class="form-control" id="itemNome" name="nome" required>
                    </div>
                    <div class="mb-3">
                        <label for="itemDescricao" class="form-label">Descrição</label>
                        <textarea class="form-control" id="itemDescricao" name="descricao" rows="3"></textarea>
                    </div>
                    <div class="mb-3">
                        <label for="itemPreco" class="form-label">Preço (R$)</label>
                        <input type="number" step="0.01" class="form-control" id="itemPreco" name="preco" required>
                    </div>
                    <div class="mb-3">
                        <label for="itemCategoria" class="form-label">Categoria</label>
                        <select class="form-select" id="itemCategoria" name="id_categoria">
                            <option value="">Nenhuma (Opcional)</option>
                            <?php foreach ($categorias as $categoria): ?>
                                <option value="<?php echo $categoria['id']; ?>"><?php echo htmlspecialchars($categoria['nome']); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="itemTipo" class="form-label">Tipo</label>
                        <select class="form-select" id="itemTipo" name="tipo" required>
                            <option value="prato">Prato</option>
                            <option value="bebida">Bebida</option>
                            </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                <button type="submit" form="itemCardapioForm" class="btn btn-primary" id="saveItemCardapioBtn">Salvar Item</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="confirmDeleteItemModal" tabindex="-1" aria-labelledby="confirmDeleteItemModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="confirmDeleteItemModalLabel">Confirmar Exclusão</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                Tem certeza que deseja excluir o item "<strong id="itemNomeExcluir"></strong>" do cardápio?
                Esta ação não pode ser desfeita.
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-danger" id="confirmDeleteItemBtn">Excluir</button>
            </div>
        </div>
    </div>
</div>


