<?php
// Kiểm tra xem Composer có tồn tại không
if (!file_exists('composer.phar')) {
    file_put_contents("composer-setup.php", file_get_contents("https://getcomposer.org/installer"));
    shell_exec("php composer-setup.php");
    unlink("composer-setup.php");
}

// Chạy lệnh cài đặt Guzzle
shell_exec("php composer.phar require guzzlehttp/guzzle");

echo "Guzzle đã được cài đặt thành công!";
?>
