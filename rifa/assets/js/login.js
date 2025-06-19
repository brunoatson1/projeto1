document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const alertContainer = document.getElementById('alertContainer');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede o envio padrão do formulário

        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        // Limpa alertas anteriores
        alertContainer.innerHTML = '';

        try {
            const response = await fetch('api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                // Redireciona para a página correta com base no tipo de usuário
                window.location.href = result.redirect;
            } else {
                // Mostra a mensagem de erro
                const alert = `
                    <div class="alert alert-danger" role="alert">
                        ${result.message}
                    </div>
                `;
                alertContainer.innerHTML = alert;
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            const alert = `
                <div class="alert alert-danger" role="alert">
                    Ocorreu um erro de comunicação. Tente novamente.
                </div>
            `;
            alertContainer.innerHTML = alert;
        }
    });
});