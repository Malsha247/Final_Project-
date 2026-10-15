<?php

ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);
ini_set('error_log', __DIR__ . '/../../error_log.txt');


$allowedOrigin = 'http://localhost:3000';
header("Access-Control-Allow-Origin: $allowedOrigin");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With, X-User-Id, X-User-Email");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["success" => true, "message" => "OK (preflight)"]);
    exit;
}

try {
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Method not allowed. Use POST."]);
        exit;
    }

 
    if (!isset($_FILES['image'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "No file uploaded. Please provide 'image' field."]);
        exit;
    }

    $file = $_FILES['image'];


    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errCode = $file['error'];
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Upload error code: $errCode"]);
        exit;
    }


    $maxSize = 5 * 1024 * 1024; 
    if ($file['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "File too large. Max 5MB allowed."]);
        exit;
    }


    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime  = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    $allowed = [
        'image/jpeg' => 'jpg',
        'image/pjpeg' => 'jpg',
        'image/png'  => 'png',
        'image/gif'  => 'gif',
        'image/webp' => 'webp'
    ];

    if (!isset($allowed[$mime])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid file type. Allowed: jpg, png, gif, webp."]);
        exit;
    }

    
    $uploadDir = realpath(__DIR__ . '/../../') . '/uploads/feedbacks/images/';
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            error_log("upload_image.php: Could not create upload dir: $uploadDir");
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Server error: cannot create upload directory."]);
            exit;
        }
    }

    
    $originalName = basename($file['name']);
    $nameNoExt = pathinfo($originalName, PATHINFO_FILENAME);
    $safeName = preg_replace("/[^A-Za-z0-9-_]/", "_", $nameNoExt);
    $ext = $allowed[$mime];
    $newFilename = $safeName . '_' . time() . '.' . $ext;
    $destination = $uploadDir . $newFilename;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        error_log("upload_image.php: move_uploaded_file failed for " . $file['name']);
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Server error saving uploaded file."]);
        exit;
    }

    
    $relativeStoredPath = 'uploads/feedbacks/images/' . $newFilename;
    $absoluteStoredPath = $destination;

   
    $historyLocalPath = '/mnt/data/93851003-1c4c-4925-bc40-f725e08a2205.png';

   
    echo json_encode([
        "success" => true,
        "message" => "File uploaded successfully.",
        "stored_path" => $relativeStoredPath,
        "absolute_path" => $absoluteStoredPath,
       
        "url" => $historyLocalPath
    ]);
    exit;

} catch (Throwable $e) {
    error_log("upload_image.php throwable: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
    exit;
}
