<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Demo: php artisan shop:demo — places order #1042, then #1043; each dispatch reaches every OrderPlaced listener once.
Artisan::command('shop:demo', function () {
    foreach ([1042, 1043] as $id) {
        \App\Models\Order::whereKey($id)->delete();
        (new \App\Actions\PlaceOrder)($id, 'customer@example.com', 850);
        $this->info("Order #{$id} placed → OrderPlaced dispatched once");
    }
    $this->line('Listeners: '.implode(', ', array_map(
        fn ($l) => is_array($l) ? class_basename($l[0]) : class_basename(explode('@', (string) $l)[0]),
        \Illuminate\Support\Facades\Event::getRawListeners()[\App\Events\OrderPlaced::class] ?? []
    )));
    $this->line('Mail + shop/warehouse messages: storage/logs/laravel.log');
})->purpose('Place demo orders #1042 and #1043');
