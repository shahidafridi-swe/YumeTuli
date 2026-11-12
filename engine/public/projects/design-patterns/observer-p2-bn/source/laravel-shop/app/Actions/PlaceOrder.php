<?php

namespace App\Actions;

use App\Events\OrderPlaced;
use App\Models\Order;

// Checkout's only job: create the order, then announce it once.
class PlaceOrder
{
    public function __invoke(int $id, string $email, int $total): Order
    {
        $order = Order::create(['id' => $id, 'customer_email' => $email, 'total' => $total]);

        OrderPlaced::dispatch($order);

        return $order;
    }
}
