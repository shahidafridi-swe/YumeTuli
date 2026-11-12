<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use Illuminate\Support\Facades\Log;

class NotifyWarehouse
{
    public function handle(OrderPlaced $event): void
    {
        $order = $event->order;
        Log::info("Warehouse: অর্ডার {$order->id} pack করুন");
    }
}
