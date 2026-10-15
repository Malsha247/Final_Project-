<?php

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

session_start();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/../../config/db.php';

try {
    // prefer logged-in seller id from session
    $seller_id = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : null;

    // for development/testing: allow seller_id via query param if no session
    if (!$seller_id && isset($_GET['seller_id'])) {
        $seller_id = intval($_GET['seller_id']);
    }

    if (!$seller_id) {
        echo json_encode(["success" => false, "message" => "Not authenticated (seller_id required)"]);
        exit;
    }

    $limit = isset($_GET['limit']) ? min(200, intval($_GET['limit'])) : 100;
    $offset = isset($_GET['offset']) ? max(0, intval($_GET['offset'])) : 0;

    $stmt = $conn->prepare("
        SELECT p.id, p.owner_name, p.address, p.phone AS listing_phone, p.image, p.description, p.created_at
        FROM plant_listings p
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
        LIMIT :limit OFFSET :offset
    ");
    $stmt->bindValue(1, $seller_id, PDO::PARAM_INT);
    $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    
    foreach ($rows as &$r) {
        $r['image_url'] = $r['image'] ? ("http://localhost/wasanthaecohusksolution/backend/" . ltrim($r['image'], '/')) : null;
    }

    echo json_encode(["success" => true, "listings" => $rows, "limit" => $limit, "offset" => $offset]);
    exit;
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
    exit;
}
