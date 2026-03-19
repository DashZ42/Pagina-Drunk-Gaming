<?php
require_once 'config.php';

if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

$userId = $_SESSION['user_id'];

// Obtener notificaciones no leídas
$stmt = $conn->prepare("SELECT id, title, message, type, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$notifications = [];
while ($row = $result->fetch_assoc()) {
    $notifications[] = $row;
}

// Contar no leídas
$stmt = $conn->prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND `read` = 0");
$stmt->bind_param("i", $userId);
$stmt->execute();
$unreadCount = $stmt->get_result()->fetch_assoc()['count'];

echo json_encode([
    'success' => true,
    'notifications' => $notifications,
    'unreadCount' => $unreadCount
]);

$stmt->close();
$conn->close();
?>