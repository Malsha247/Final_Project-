<?php
require_once __DIR__ . '/../_cors.php';
header("Content-Type: application/json");
require_once __DIR__ . '/../../config/db.php';

try {

    $uploadsDir = __DIR__ . '/../../uploads/products';
    if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0755, true);

    
    if (!empty($_FILES['image']) && isset($_POST['name'])) {
        $name = trim($_POST['name']);
        $description = trim($_POST['description'] ?? '');
        $price = (float)($_POST['price'] ?? 0);
        $stock = (int)($_POST['stock'] ?? 0);
        $category = trim($_POST['category'] ?? '');

   
        $tmp = $_FILES['image']['tmp_name'];
        $orig = basename($_FILES['image']['name']);
        $ext = strtolower(pathinfo($orig, PATHINFO_EXTENSION));
        $allowed = ['jpg','jpeg','png','gif', 'webp'];

        if (!in_array($ext, $allowed)) {
            echo json_encode(["success" => false, "message" => "Invalid image format. Allowed: jpg,jpeg,png,gif,webp"]);
            exit;
        }

        if ($_FILES['image']['size'] > 3 * 1024 * 1024) {
            echo json_encode(["success" => false, "message" => "File too large. Max 3MB"]);
            exit;
        }

        $filename = uniqid('prod_', true) . '.' . $ext;
        $target = $uploadsDir . '/' . $filename;

        if (!move_uploaded_file($tmp, $target)) {
            echo json_encode(["success" => false, "message" => "Upload failed"]);
            exit;
        }

        $image_url = 'uploads/products/' . $filename;
    } else {

        $data = json_decode(file_get_contents("php://input"), true);
        $name = trim($data['name'] ?? '');
        $description = $data['description'] ?? '';
        $price = (float)($data['price'] ?? 0);
        $stock = (int)($data['stock'] ?? 0);
        $category = $data['category'] ?? '';
        $image_url = $data['image_url'] ?? null;
    }

    if (empty($name)) {
        echo json_encode(["success" => false, "message" => "Product name required"]);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO product (name, description, price, stock, image_url, category) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$name, $description, $price, $stock, $image_url, $category]);

    echo json_encode(["success" => true, "message" => "Product added", "id" => $conn->lastInsertId()]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
