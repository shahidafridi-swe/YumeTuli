<?php

namespace Tests\Feature;

use App\Actions\PlaceOrder;
use App\Events\OrderPlaced;
use App\Listeners\NotifyShop;
use App\Listeners\NotifyWarehouse;
use App\Listeners\SendOrderConfirmation;
use App\Mail\OrderConfirmation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class OrderPlacedTest extends TestCase
{
    use RefreshDatabase;

    public function test_each_listener_is_registered_exactly_once(): void
    {
        $listeners = Event::getRawListeners()[OrderPlaced::class] ?? [];
        $names = array_map(fn ($l) => is_array($l) ? $l[0] : (is_string($l) ? explode('@', $l)[0] : get_class($l)), $listeners);

        sort($names);
        $this->assertSame([NotifyShop::class, NotifyWarehouse::class, SendOrderConfirmation::class], $names);
    }

    public function test_one_dispatch_reaches_all_three_listeners_with_the_same_order(): void
    {
        Mail::fake();
        Log::spy();

        (new PlaceOrder)(1043, 'customer@example.com', 850);

        Mail::assertSent(OrderConfirmation::class, 1);
        Mail::assertSent(OrderConfirmation::class, fn ($m) => $m->order->id === 1043);
        Log::shouldHaveReceived('info')->with('Shop: নতুন অর্ডার 1043 প্রস্তুত করুন')->once();
        Log::shouldHaveReceived('info')->with('Warehouse: অর্ডার 1043 pack করুন')->once();
    }
}
