<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$usernameOrEmail = trim($data['username'] ?? '');
$password = $data['password'] ?? '';
$rememberMe = $data['rememberMe'] ?? false;

if (empty($usernameOrEmail) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Usuario y contraseña son obligatorios']);
    exit;
}

// Buscar usuario por username o email
$stmt = $conn->prepare("SELECT id, username, email, password, is_admin FROM users WHERE username = ? OR email = ?");
$stmt->bind_param("ss", $usernameOrEmail, $usernameOrEmail);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Usuario o contraseña incorrectos']);
    exit;
}

$user = $result->fetch_assoc();

// Verificar contraseña
if (!password_verify($password, $user['password'])) {
    echo json_encode(['success' => false, 'message' => 'Usuario o contraseña incorrectos']);
    exit;
}

// ✅ Configurar sesión ANTES de iniciarla (si es remember me)
if ($rememberMe) {
    // Cerrar sesión actual si existe
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_destroy();
    }
    
    // Configurar nueva sesión con duración extendida
    ini_set('session.gc_maxlifetime', 2592000); // 30 días
    session_set_cookie_params([
        'lifetime' => 2592000,
        'path' => '/',
        'domain' => '',
        'secure' => false, // Cambiar a true en producción con HTTPS
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    
    // Reiniciar sesión
    session_start();
} else {
    // Asegurar que la sesión esté activa
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

// Guardar datos en sesión
$_SESSION['user_id'] = $user['id'];
$_SESSION['username'] = $user['username'];
$_SESSION['email'] = $user['email'];
$_SESSION['is_admin'] = $user['is_admin'] ?? 0; // ✅ Usar null coalescing

echo json_encode([
    'success' => true,
    'message' => 'Login exitoso',
    'user' => [
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'is_admin' => $user['is_admin'] ?? 0
    ]
]);

$stmt->close();
$conn->close();
?>