<?php
require_once 'config.php';

if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'No estás logueado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$authid = trim($data['authid'] ?? '');
$csTag = trim($data['csTag'] ?? '');
$password = $data['password'] ?? '';
$demoRecording = $data['demoRecording'] ?? 'no';

if (empty($authid)) {
    echo json_encode(['success' => false, 'message' => 'SteamID es obligatorio']);
    exit;
}

if (empty($csTag)) {
    echo json_encode(['success' => false, 'message' => 'El Tag CS es obligatorio']);
    exit;
}

// Verificar si el authid existe en amx_admins
$stmt = $conn->prepare("SELECT id FROM amx_admins WHERE authid = ?");
$stmt->bind_param("s", $authid);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Este SteamID no está registrado como admin en el servidor']);
    exit;
}

// Verificar si ya existe configuración
$stmt = $conn->prepare("SELECT id FROM admin_configs WHERE authid = ?");
$stmt->bind_param("s", $authid);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // Actualizar
    if (!empty($password)) {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("UPDATE admin_configs SET cs_tag = ?, admin_password = ?, demo_recording = ? WHERE authid = ?");
        $stmt->bind_param("sssi", $csTag, $hashedPassword, $demoRecording, $authid);
    } else {
        $stmt = $conn->prepare("UPDATE admin_configs SET cs_tag = ?, demo_recording = ? WHERE authid = ?");
        $stmt->bind_param("ssi", $csTag, $demoRecording, $authid);
    }
} else {
    // Insertar
    if (!empty($password)) {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO admin_configs (authid, cs_tag, admin_password, demo_recording) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("isss", $authid, $csTag, $hashedPassword, $demoRecording);
    } else {
        $stmt = $conn->prepare("INSERT INTO admin_configs (authid, cs_tag, demo_recording) VALUES (?, ?, ?)");
        $stmt->bind_param("iss", $authid, $csTag, $demoRecording);
    }
}

if ($stmt->execute()) {
    echo json_encode([
        'success' => true, 
        'message' => 'Configuración guardada correctamente. Los cambios se aplicarán en el servidor.',
        'config' => [
            'cs_tag' => $csTag,
            'demo_recording' => $demoRecording
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al guardar: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>