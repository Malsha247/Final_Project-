<?php

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); echo json_encode(["success"=>true]); exit; }

ob_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../config/db.php';

try {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($id <= 0) {
        $raw = ob_get_clean();
        echo json_encode(["success"=>false,"message"=>"id required","server_debug"=>trim(substr($raw,0,200))]);
        exit;
    }

    // Check if users table exists
    $dbName = $conn->query("SELECT DATABASE()")->fetchColumn();
    $tblCheck = $conn->prepare("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = ? AND table_name = 'users'");
    $tblCheck->execute([$dbName]);
    $usersExists = (bool)$tblCheck->fetchColumn();

    if ($usersExists) {
        $sql = "SELECT p.*, u.email AS seller_email FROM plant_listings p LEFT JOIN users u ON u.id = p.user_id WHERE p.id = ? LIMIT 1";
    } else {
        $sql = "SELECT p.*, NULL AS seller_email FROM plant_listings p WHERE p.id = ? LIMIT 1";
    }

    $stmt = $conn->prepare($sql);
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    $raw = ob_get_clean();

    if (!$row) {
        http_response_code(404);
        echo json_encode(["success"=>false,"message"=>"Not found","server_debug"=>trim(substr($raw,0,200))]);
        exit;
    }

    // Normalize image URL
    $row['image_url'] = null;
    if (!empty($row['image'])) {
        if (strpos($row['image'], 'http') === 0) $row['image_url'] = $row['image'];
        else $row['image_url'] = "http://localhost/wasanthaecohusksolution/backend/" . ltrim($row['image'], '/');
    }

    echo json_encode(["success"=>true,"plant"=>$row,"server_debug"=>trim(substr($raw,0,200))]);
    exit;
} catch (Exception $e) {
    $raw = ob_get_clean();
    http_response_code(500);
    echo json_encode(["success"=>false,"message"=>$e->getMessage(),"server_debug"=>trim(substr($raw,0,400))]);
    exit;
}
