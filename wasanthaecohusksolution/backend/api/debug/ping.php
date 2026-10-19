<?php
require_once __DIR__ . '/../_cors.php';
header("Content-Type: application/json");
echo json_encode(["ok" => true, "time" => date(DATE_ISO8601)]);
