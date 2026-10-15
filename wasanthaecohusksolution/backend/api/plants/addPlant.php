<?php


header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/db.php';

try {
    $user_id     = intval($_POST['user_id'] ?? 0);
    $owner_name  = trim($_POST['owner_name'] ?? '');
    $address     = trim($_POST['address'] ?? '');
    $phone       = trim($_POST['phone'] ?? '');
    $description = trim($_POST['description'] ?? '');

    if (!$user_id || !$owner_name || !$address || !$phone) {
        echo json_encode([
            "success" => false,
            "message" => "Required fields missing"
        ]);
        exit;
    }

    
    $imagePath = null;
    if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . "/../../uploads/plants/";
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $fileName = time() . "_" . basename($_FILES['image']['name']);
        $target = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $target)) {
            $imagePath = "uploads/plants/" . $fileName;
        }
    }

    $stmt = $conn->prepare("
        INSERT INTO plant_listings
        (user_id, owner_name, address, phone, description, image, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())
    ");

    $stmt->execute([
        $user_id,
        $owner_name,
        $address,
        $phone,
        $description,
        $imagePath
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Plant listed successfully"
    ]);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
    exit;
}
