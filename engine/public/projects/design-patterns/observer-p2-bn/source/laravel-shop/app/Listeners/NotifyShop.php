<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use Illuminate\Support\Facades\Log;

class NotifyShop
{
    public function handle(OrderPlaced $event): void
    {
        $order = $event->order;
        Log::info("Shop: নতুন অর্ডার {$order->id} প্রস্তুত করুন");
    }
}
