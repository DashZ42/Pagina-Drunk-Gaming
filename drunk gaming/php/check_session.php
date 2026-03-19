<?php
require_once 'config.php';

if (isLoggedIn()) {
    $user = getCurrentUser();
    
    // Obtener configuración de admin si existe
    $userId = $user['id'];
    $adminConfig = null;
    
    $stmt = $conn->prepare("SELECT cs_tag, demo_recording FROM admin_configs WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $adminConfig = $result->fetch_assoc();
    }
    
    echo json_encode([
        'loggedIn' => true,
        'user' => $user,
        'adminConfig' => $adminConfig
    ]);
} else {
    echo json_encode(['loggedIn' => false]);
}

$conn->close();
?>