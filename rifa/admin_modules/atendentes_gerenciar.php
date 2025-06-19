<?php
// Este arquivo é incluído por admin.php, entÃ£o jÃ¡ tem acesso a $pdo e $_SESSION.
?>

<div class="card shadow-sm mb-4">
    <div class="card-header bg-light">
        <h5 class="mb-0">Gerenciar Atendentes</h5>
    </div>
    <div class="card-body">
        <div class="mb-3">
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#atendenteModal" id="addAtendenteBtn">
                <i class="bi bi-person-plus me-2"></i>Adicionar Atendente
            </button>
        </div>

        <div class="table-responsive">
            <table class="table table-hover table-striped" id="atendentesTable">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Nome de Usuário</th>
                        <th scope="col">Nome Completo</th>
                        <th scope="col">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colspan="4" class="text-center">Carregando atendentes...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="modal fade" id="atendenteModal" tabindex="-1" aria-labelledby="atendenteModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="atendenteModalLabel">Adicionar Novo Atendente</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                <form id="atendenteForm">
                    <input type="hidden" id="atendenteId" name="id">
                    <div class="mb-3">
                        <label for="atendenteNomeUsuario" class="form-label">Nome de Usuário</label>
                        <input type="text" class="form-control" id="atendenteNomeUsuario" name="nome_usuario" required>
                    </div>
                    <div class="mb-3">
                        <label for="atendenteNomeCompleto" class="form-label">Nome Completo</label>
                        <input type="text" class="form-control" id="atendenteNomeCompleto" name="nome_completo" required>
                    </div>
                    <div class="mb-3">
                        <label for="atendenteSenha" class="form-label">Senha</label>
                        <input type="password" class="form-control" id="atendenteSenha" name="senha">
                        <small class="form-text text-muted" id="senhaHelpText">Deixe em branco para não alterar a senha existente.</small>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                <button type="submit" form="atendenteForm" class="btn btn-primary" id="saveAtendenteBtn">Salvar Atendente</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="confirmDeleteAtendenteModal" tabindex="-1" aria-labelledby="confirmDeleteAtendenteModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="confirmDeleteAtendenteModalLabel">Confirmar Exclusão</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                Tem certeza que deseja excluir o atendente "<strong id="atendenteNomeExcluir"></strong>"?
                Esta ação não pode ser desfeita.
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-danger" id="confirmDeleteAtendenteBtn">Excluir</button>
            </div>
        </div>
    </div>
</div>

