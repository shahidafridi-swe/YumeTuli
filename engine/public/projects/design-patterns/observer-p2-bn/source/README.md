# Observer Pattern in Laravel — Part 2 (runnable source)

Fresh Laravel 13 app with the video's code:

- `app/Events/OrderPlaced.php` — `Dispatchable`, constructor `public Order $order`
- `app/Listeners/SendOrderConfirmation.php`, `NotifyShop.php`, `NotifyWarehouse.php` — `handle(OrderPlaced $event): void`
- `app/Actions/PlaceOrder.php` — checkout: create order, `OrderPlaced::dispatch($order);` once
- Listener registration: **event discovery** (Laravel 11+ default scans `app/Listeners`). No `Event::listen` calls,
  so every listener is registered exactly once.

## Run
```bash
cd laravel-shop
composer install
cp .env.example .env && php artisan key:generate
touch database/database.sqlite && php artisan migrate
php artisan event:list --event=OrderPlaced   # 3 listeners, each once
php artisan shop:demo                        # orders #1042 and #1043
php artisan test --filter=OrderPlacedTest    # 2 tests pass
```
Mail uses the `log` mailer, so the email and shop/warehouse messages appear in `storage/logs/laravel.log`.
- In the video, order #1042 happens before NotifyWarehouse is added (2 listeners); this source is the final state (3 listeners), so the demo's #1042 also reaches the warehouse.
