<?php
require_once 'config.php';

if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

$userId = $_SESSION['user_id'];
$data = json_decode(file_get_contents('php://input'), true);
$notificationId = $data['id'] ?? null;

if ($notificationId) {
    // Marcar una notificación como leída
    $stmt = $conn->prepare("UPDATE notifications SET `read` = 1 WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $notificationId, $userId);
    $stmt->execute();
} else {
    // Marcar todas como leídas
    $stmt = $conn->prepare("UPDATE notifications SET `read` = 1 WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
}

echo json_encode(['success' => true]);
$conn->close();
?>