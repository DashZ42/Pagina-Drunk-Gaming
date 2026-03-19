<?php
require_once 'config.php';

// Destruir sesión
session_unset();
session_destroy();

// Eliminar cookie de sesión
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time() - 3600, '/');
}

echo json_encode(['success' => true, 'message' => 'Sesión cerrada correctamente']);
?>