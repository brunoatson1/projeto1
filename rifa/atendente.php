<?php
// Para garantir que os erros sejam exibidos (mantenha isso por enquanto para depuração)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// PASSO CRUCIAL: O auth_check.php DEVE SER O PRIMEIRO include em páginas protegidas.
// Ele incluirá o config.php, que define BASE_URL e inicia a sessão.
require_once 'includes/auth_check.php'; 

// As definições de título e JS podem vir depois das verificações de segurança e da sessão.
$page_title = 'Painel do Atendente';
$custom_js = 'assets/js/atendente.js';

// Redireciona se não for atendente (essa verificação agora terá $_SESSION e BASE_URL definidos)
if (!isset($_SESSION['user_tipo']) || $_SESSION['user_tipo'] !== 'atendente') {
    header('Location: ' . BASE_URL . 'cozinha.php');
    exit;
}

// A partir daqui, o usuário é 'atendente' e está logado.
require_once 'includes/header.php'; // Inclua o cabeçalho HTML APÓS todas as verificações e definições PHP.
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h1>Visão das Mesas</h1>
</div>

<div id="mesasContainer" class="row align-items-center justify-content-center" style="min-height: 50vh;">
    <div class="col-12 text-center">
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Carregando mesas...</span>
        </div>
    </div>
</div>

<div class="modal fade" id="pedidoModal" tabindex="-1" aria-labelledby="pedidoModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="pedidoModalLabel"></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="row">
                    <div class="col-md-5">
                        <h4>Cardápio</h4>
                        <div id="cardapioContainer" style="max-height: 60vh; overflow-y: auto;">
                            <div class="text-center p-5">
                                <div class="spinner-border text-secondary" role="status">
                                    <span class="visually-hidden">Carregando cardápio...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-7">
                        <div id="formNovoPedido">
                            <h4>Resumo do Pedido</h4>
                            <form id="formAbertura">
                                <div class="mb-3">
                                    <label for="clienteNome" class="form-label">Nome do Cliente (Opcional)</label>
                                    <input type="text" class="form-control" id="clienteNome">
                                </div>
                                <div id="resumoPedido">
                                    <p>Adicione itens do cardápio.</p>
                                </div>
                                <button type="submit" class="btn btn-primary mt-3 w-100">Enviar Pedido para Cozinha</button>
                            </form>
                        </div>

                        <div id="formPedidoExistente" style="display: none;">
                            <h4>Detalhes do Pedido</h4>
                            <p><strong>Cliente:</strong> <span id="clienteNomeExistente"></span></p>
                            <p><strong>Status:</strong> <span id="statusPedido" class="badge bg-info"></span></p>
                            <div id="resumoPedidoExistente">
                                </div>
                            <div class="mt-4">
                                <h5>Fechar Conta</h5>
                                <div class="input-group">
                                    <select class="form-select" id="formaPagamento">
                                        <option value="nao_definido" selected>Selecione a forma de pagamento...</option>
                                        <option value="dinheiro">Dinheiro</option>
                                        <option value="cartao_credito">Cartão de Crédito</option>
                                        <option value="cartao_debito">Cartão de Débito</option>
                                        <option value="pix">PIX</option>
                                    </select>
                                    <button class="btn btn-success" type="button" id="btnFecharConta">Finalizar Pedido</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>