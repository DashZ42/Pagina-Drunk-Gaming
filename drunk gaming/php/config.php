<?php


ini_set('display_errors', 1);
error_reporting(E_ALL);

// Headers ANTES de cualquier output
if (!headers_sent()) {
    header('Content-Type: application/json');
}

session_start();

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'drunk_gaming');

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    // Usar http_response_code para mejor compatibilidad
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $conn->connect_error]);
    exit; // 👈 Importante: detener ejecución
}

$conn->set_charset("utf8mb4");
function isLoggedIn() {
    return isset($_SESSION['user_id']) && isset($_SESSION['username']);
}

function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }
    return [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'email' => $_SESSION['email'] ?? ''
    ];
}

header('Content-Type: application/json');
?>