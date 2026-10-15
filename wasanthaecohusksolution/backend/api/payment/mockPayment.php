<?php

$order_id = isset($_GET['order_id']) ? intval($_GET['order_id']) : 0;
$total = isset($_GET['total']) ? floatval($_GET['total']) : 0;
$return_url = isset($_GET['return_url']) ? $_GET['return_url'] : null;
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Mock Payment - Order <?=htmlspecialchars($order_id)?></title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;background:#f5f7f6;padding:40px}
    .card{background:#fff;padding:24px;border-radius:8px;max-width:540px;margin:40px auto;box-shadow:0 10px 30px rgba(0,0,0,0.06)}
    button{background:#2e7d32;color:#fff;padding:10px 14px;border:0;border-radius:6px;cursor:pointer}
  </style>
</head>
<body>
  <div class="card">
    <h2>Mock Payment</h2>
    <p>Order ID: <strong><?=htmlspecialchars($order_id)?></strong></p>
    <p>Amount: <strong>Rs. <?=number_format($total,2)?></strong></p>
    <p>This is a development mock. Click Pay to simulate a successful card charge.</p>

    <form method="POST" action="confirmPayment.php">
      <input type="hidden" name="order_id" value="<?=htmlspecialchars($order_id)?>" />
      <input type="hidden" name="amount" value="<?=htmlspecialchars($total)?>" />
      <input type="hidden" name="transaction_id" value="MOCKTXN<?=time()?>" />
      <input type="hidden" name="return_url" value="<?=htmlspecialchars($return_url)?>" />
      <button type="submit">Pay Now (Mock)</button>
    </form>
  </div>
</body>
</html>
