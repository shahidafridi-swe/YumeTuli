<?php
// Strategy Pattern — পর্ব ৩: Delivery fee (plain PHP 8.1+, no framework)
// Run: php checkout.php              → Standard ৳60, Express ৳100 (4 km)
//      php checkout.php express 4    → ৳100
// Rate change (video scene): edit ONLY the ExpressDelivery line `$km * 10` → `$km * 15`  → Express 4 km = ৳120

declare(strict_types=1);

// Strategy interface
interface DeliveryStrategy
{
    public function fee(int $km): int;
}

// Concrete strategies
class StandardDelivery implements DeliveryStrategy
{
    public function fee(int $km): int
    {
        return 60;
    }
}

class ExpressDelivery implements DeliveryStrategy
{
    public function fee(int $km): int
    {
        return 60 + $km * 10; // rate-change scene: 10 → 15
    }
}

// Context
class CheckoutService
{
    public function __construct(private DeliveryStrategy $strategy)
    {
    }

    public function deliveryFee(int $km): int
    {
        return $this->strategy->fee($km);
    }
}

// Same selection the Laravel controller does (laravel/CheckoutController.php)
function strategyFor(string $method): DeliveryStrategy
{
    return match ($method) {
        'standard' => new StandardDelivery(),
        'express' => new ExpressDelivery(),
    };
}

if (PHP_SAPI === 'cli' && realpath($argv[0]) === __FILE__) {
    if (isset($argv[1])) {
        $km = (int) ($argv[2] ?? 4);
        $service = new CheckoutService(strategyFor($argv[1]));
        echo "{$argv[1]} {$km} km: ৳", $service->deliveryFee($km), PHP_EOL;
        exit;
    }
    foreach (['standard', 'express'] as $method) {
        $service = new CheckoutService(strategyFor($method));
        echo str_pad($method, 9), "4 km: ৳", $service->deliveryFee(4), PHP_EOL;
    }
}
