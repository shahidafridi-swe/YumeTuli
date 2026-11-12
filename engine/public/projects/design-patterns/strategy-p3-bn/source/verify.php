<?php
// Checks every number shown in the video. Run: php verify.php
declare(strict_types=1);
require __DIR__ . '/checkout.php';

$fail = 0;
$check = function (string $name, int $got, int $want) use (&$fail): void {
    $ok = $got === $want;
    $fail += $ok ? 0 : 1;
    echo ($ok ? 'PASS' : 'FAIL'), "  {$name}  (got {$got})", PHP_EOL;
};

$check('Standard 4 km = 60', (new CheckoutService(new StandardDelivery()))->deliveryFee(4), 60);
$check('Express 4 km = 60 + 4 × 10 = 100', (new CheckoutService(new ExpressDelivery()))->deliveryFee(4), 100);
$check('match("standard") → 60', (new CheckoutService(strategyFor('standard')))->deliveryFee(4), 60);
$check('match("express") → 100', (new CheckoutService(strategyFor('express')))->deliveryFee(4), 100);

// Rate change: copy checkout.php, change ONLY `$km * 10` → `$km * 15`, run it.
$src = file_get_contents(__DIR__ . '/checkout.php');
$changed = str_replace('return 60 + $km * 10;', 'return 60 + $km * 15;', $src, $n);
$tmp = sys_get_temp_dir() . '/checkout-rate15-' . getmypid() . '.php';
file_put_contents($tmp, $changed);
$express = trim((string) shell_exec(escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg($tmp) . ' express 4'));
$standard = trim((string) shell_exec(escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg($tmp) . ' standard 4'));
unlink($tmp);
$check('rate change edits exactly 1 place', $n, 1);
$check('Express after rate change = 60 + 4 × 15 = 120', (int) preg_replace('/\D+/', '', explode('৳', $express)[1] ?? ''), 120);
$check('Standard unchanged after rate change = 60', (int) preg_replace('/\D+/', '', explode('৳', $standard)[1] ?? ''), 60);

try {
    strategyFor('same_day');
    echo "FAIL  unknown method should throw", PHP_EOL;
    $fail++;
} catch (\UnhandledMatchError) {
    echo "PASS  unknown method throws UnhandledMatchError (Laravel validation blocks it first)", PHP_EOL;
}
exit($fail ? 1 : 0);
