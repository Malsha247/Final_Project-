<?php
// Wrapper to run checkout.php from CLI while letting checkout.php read php://input
// Usage: php run_checkout_cli.php < payload.json

// Ensure checkout sees a POST request
$_SERVER['REQUEST_METHOD'] = 'POST';
// Adjust include path to checkout.php
require_once __DIR__ . '/../api/orders/checkout.php';
