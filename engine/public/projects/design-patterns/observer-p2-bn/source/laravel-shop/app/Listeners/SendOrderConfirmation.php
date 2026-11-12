<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use App\Mail\OrderConfirmation;
use Illuminate\Support\Facades\Mail;

class SendOrderConfirmation
{
    public function handle(OrderPlaced $event): void
    {
        $order = $event->order;
        Mail::to($order->customer_email)
            ->send(new OrderConfirmation($order));
    }
}
