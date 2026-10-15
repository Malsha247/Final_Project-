<?php

require_once __DIR__ . '/../plants/helpers/sendEmailFallback.php';

function sendOrderStatusEmail(
    $toEmail,
    $toName,
    $orderId,
    $newStatus,
    $trackingNo = ''
) {
    if (!$toEmail) return false;

    $subject = "Order #{$orderId} Status Update";

    $trackingHtml = $trackingNo
        ? "<p><strong>Tracking Number:</strong> {$trackingNo}</p>"
        : "";

    $statusMessage = match ($newStatus) {
        'Pending'    => 'Your order has been received.',
        'Processing' => 'Your order is being prepared.',
        'Shipped'    => 'Your order has been shipped ',
        'Delivered'  => 'Your order has been delivered ',
        'Canceled'   => 'Your order has been canceled ',
        default      => 'Order status updated.',
    };

    $body = "
        <h3>Hello {$toName},</h3>
        <p><strong>{$statusMessage}</strong></p>
        <p>Order ID: <strong>#{$orderId}</strong></p>
        <p>Status: <strong>{$newStatus}</strong></p>
        {$trackingHtml}
        <hr>
        <p>Thank you for shopping with us </p>
        <p><strong>Wasantha Eco Husk Solutions</strong></p>
    ";

    return send_email_fallback(
        $toEmail,
        $subject,
        $body,
        'wasanthaeco2001@gmail.com',
        'Wasantha Eco Husk Solutions'
    );
}
