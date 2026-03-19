<?php
require_once 'config.php';

if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

$userId = $_SESSION['user_id'];

// Obtener mensajes
$stmt = $conn->prepare("
    SELECT m.id, m.subject, m.message, m.read, m.created_at, 
           u.username as from_username, u.id as from_user_id
    FROM messages m
    LEFT JOIN users u ON m.from_user_id = u.id
    WHERE m.to_user_id = ?
    ORDER BY m.created_at DESC
    LIMIT 10
");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$messages = [];
while ($row = $result->fetch_assoc()) {
    $messages[] = $row;
}

// Contar no leídos
$stmt = $conn->prepare("SELECT COUNT(*) as count FROM messages WHERE to_user_id = ? AND `read` = 0");
$stmt->bind_param("i", $userId);
$stmt->execute();
$unreadCount = $stmt->get_result()->fetch_assoc()['count'];

echo json_encode([
    'success' => true,
    'messages' => $messages,
    'unreadCount' => $unreadCount
]);

$stmt->close();
$conn->close();
?>