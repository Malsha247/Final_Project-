<?php
require_once __DIR__ . '/../_cors.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;


require_once __DIR__ . '/../../vendor/autoload.php';

function sendOrderEmail($toEmail, $toName, $orderId, $paymentMethod, $total, $address) {
  $mail = new PHPMailer(true);

  try {
   
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'wasanthaeco2001@gmail.com'; 
    $mail->Password = (getenv('SMTP_PASSWORD_API_ORDERS_SENDORDERNOTIFICATION') ?: '');   
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;

   
    $mail->setFrom('wasanthaeco2001@gmail.com', 'Wasantha Eco Husk Solutions');
    $mail->addAddress($toEmail, $toName);

 
    $mail->isHTML(true);
    $mail->Subject = "Order Confirmation #$orderId";
    $mail->Body = "
      <h3>Thank you for your order, $toName! ðŸ¥¥</h3>
      <p>Your order <b>#$orderId</b> has been placed successfully.</p>
      <p><b>Payment Method:</b> $paymentMethod</p>
      <p><b>Total:</b> Rs. $total</p>
      <p><b>Shipping Address:</b> $address</p>
      <hr>
      <p>Weâ€™ll notify you when your order is on its way!</p>
      <p> Wasantha Eco Husk Solutions ðŸŒ¿</p>
    ";

    $mail->send();
  } catch (Exception $e) {
    error_log("Mail Error: " . $mail->ErrorInfo);
  }

  
}
