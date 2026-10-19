<?php
require_once __DIR__ . '/../_cors.php';
header("Content-Type: application/json");

require_once __DIR__ . '/../../config/db.php';

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Invalid JSON"]);
    exit;
}

$user_id = intval($data["user_id"] ?? 0);
$name = trim($data["name"] ?? "");
$address = trim($data["address"] ?? "");
$phone = trim($data["phone"] ?? "");
$description = trim($data["description"] ?? "");
$image1 = trim($data["image_1"] ?? "");
$image2 = trim($data["image_2"] ?? "");
$latitude = $data["latitude"] ?? null;
$longitude = $data["longitude"] ?? null;

if (!$user_id || !$name || !$address || !$phone) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

try {
    $stmt = $conn->prepare("
        INSERT INTO husk_sellers 
        (user_id, name, address, phone, description, image_1, image_2, latitude, longitude, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");

    $stmt->execute([
        $user_id,
        $name,
        $address,
        $phone,
        $description,
        $image1,
        $image2,
        $latitude,
        $longitude
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Husk data saved successfully"
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
