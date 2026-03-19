<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$username = trim($data['username'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$passwordConfirm = $data['passwordConfirm'] ?? '';

// Validaciones
if (empty($username) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
    exit;
}

if (strlen($username) < 3 || strlen($username) > 50) {
    echo json_encode(['success' => false, 'message' => 'El usuario debe tener entre 3 y 50 caracteres']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Email inválido']);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'La contraseña debe tener al menos 6 caracteres']);
    exit;
}

if ($password !== $passwordConfirm) {
    echo json_encode(['success' => false, 'message' => 'Las contraseñas no coinciden']);
    exit;
}

// Verificar si el usuario ya existe
$stmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
$stmt->bind_param("ss", $username, $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'El usuario o email ya están registrados']);
    exit;
}

// Hash de contraseña
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insertar usuario
$stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $username, $email, $hashedPassword);

if ($stmt->execute()) {
    $userId = $conn->insert_id;
    
    // Iniciar sesión
    $_SESSION['user_id'] = $userId;
    $_SESSION['username'] = $username;
    $_SESSION['email'] = $email;
    $_SESSION['is_admin'] = 0;
    
    echo json_encode([
        'success' => true,
        'message' => 'Registro exitoso',
        'user' => [
            'id' => $userId,
            'username' => $username,
            'email' => $email
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al registrar: ' . $stmt->error]);
}


session_write_close();
$stmt->close();
$conn->close();
?>