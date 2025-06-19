<?php 
// Inclui o arquivo de footer se ele existir
if (file_exists('footes.php')) {
    include 'footes.php';
} else {
    // Caso o arquivo não exista, mostra o footer padrão
?>
    </main> <!-- Feche a tag main se ela foi aberta antes -->
    
    <footer class="bg-dark text-white text-center p-3 mt-5">
        <div class="container">
            &copy; <?php echo date('Y'); ?> Seu Restaurante. Todos os direitos reservados.
        </div>
    </footer>

    <script src="assets/js/bootstrap.bundle.min.js"></script>
    <?php if (isset($custom_js)): ?>
        <script src="<?php echo $custom_js; ?>"></script>
    <?php endif; ?>
</body>
</html>
<?php } ?>