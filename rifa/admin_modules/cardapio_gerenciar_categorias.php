<?php
// Este arquivo Ã© incluÃ­do por cardapio_gerenciar_pratos.php, que por sua vez Ã© incluÃ­do por admin.php.
// EntÃ£o, ele jÃ¡ tem acesso ao objeto $pdo e Ã  sessÃ£o do usuÃ¡rio.
?>

<div class="mb-3">
    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#categoriaModal" id="addCategoriaBtn">
        <i class="bi bi-plus-circle me-2"></i>Adicionar Categoria
    </button>
</div>

<div class="table-responsive">
    <table class="table table-hover table-striped" id="categoriasTable">
        <thead>
            <tr>
                <th scope="col">ID</th>
                <th scope="col">Nome da Categoria</th>
                <th scope="col">Ações</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td colspan="3" class="text-center">Carregando categorias...</td>
            </tr>
        </tbody>
    </table>
</div>

<div class="modal fade" id="categoriaModal" tabindex="-1" aria-labelledby="categoriaModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="categoriaModalLabel">Adicionar Nova Categoria</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                <form id="categoriaForm">
                    <input type="hidden" id="categoriaId" name="id">
                    <div class="mb-3">
                        <label for="categoriaNome" class="form-label">Nome da Categoria</label>
                        <input type="text" class="form-control" id="categoriaNome" name="nome" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                <button type="submit" form="categoriaForm" class="btn btn-primary" id="saveCategoriaBtn">Salvar Categoria</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="confirmDeleteModal" tabindex="-1" aria-labelledby="confirmDeleteModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="confirmDeleteModalLabel">Confirmar Exclusão</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                Tem certeza que deseja excluir a categoria "<strong id="categoriaNomeExcluir"></strong>"?
                Esta ação não pode ser desfeita.
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Excluir</button>
            </div>
        </div>
    </div>
</div>
