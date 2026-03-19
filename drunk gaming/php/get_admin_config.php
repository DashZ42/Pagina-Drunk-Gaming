<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$authid = trim($data['authid'] ?? '');

if (empty($authid)) {
    echo json_encode(['success' => false, 'message' => 'SteamID es obligatorio']);
    exit;
}

$stmt = $conn->prepare("SELECT cs_tag, demo_recording FROM admin_configs WHERE authid = ?");
$stmt->bind_param("s", $authid);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $config = $result->fetch_assoc();
    echo json_encode([
        'success' => true,
        'config' => $config
    ]);
} else {
    echo json_encode([
        'success' => true,
        'config' => null
    ]);
}

$stmt->close();
$conn->close();
?>