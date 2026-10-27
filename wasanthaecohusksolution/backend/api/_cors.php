<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$allowed_origins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://final-project-8c7g.vercel.app'
];

// Append rather than replace Vary so cache directives set elsewhere survive.
header('Vary: Origin', false);

$is_allowed_origin = in_array($origin, $allowed_origins, true);
if ($is_allowed_origin) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-User-Id, X-User-Email');
    header('Access-Control-Max-Age: 600');
}
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Do not reflect untrusted origins. A browser will reject this response
    // because it has no Access-Control-Allow-Origin header.
    http_response_code($is_allowed_origin ? 204 : 403);
    exit;
}
