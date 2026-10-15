<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

echo json_encode(["ok" => true, "time" => date(DATE_ISO8601)]);
