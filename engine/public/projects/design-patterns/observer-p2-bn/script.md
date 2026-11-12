# Dev Diary — Observer Pattern in Laravel, পর্ব ২

Voiceover: `recordings/design-patterns/observer-p2.mp3` (106.8s), user script (expression tags = delivery only). Scene 7 holds 1.2s on the three listeners. Brand outro auto-appended (`"outro": "devdiary"`).

Runnable Laravel 13 source: `source/laravel-shop` (see `source/README.md`) — `php artisan event:list --event=OrderPlaced`, `php artisan shop:demo`, `php artisan test --filter=OrderPlacedTest` (2 tests pass). Listeners are registered by event discovery only, so each runs exactly once.

| # | sec | On screen | Voiceover |
|---|---|---|---|
| 1 | 11.82 | অর্ডার *#1042* | তুমি একটা অর্ডার দিলে। তোমার inbox-এ এল confirmation email, আর দোকানদার পেলেন নতুন অর্ডারের notification। কাল যদি warehouse-কেও জানাতে হয়, তাহলে কি আবার checkout-এর code বদলাতে হবে? |
| 2 | 15.61 | *OrderPlaced* event | ধরি, আমাদের Laravel app-এ checkout-এর কাজ হলো অর্ডারটা তৈরি করা। অর্ডারটা save হলে আমরা একটা event dispatch করি। নাম OrderPlaced। এর সঙ্গে order object-টা পাঠাই, যাতে যে এই খবর পাবে সে বুঝতে পারে ঠিক কোন অর্ডারটা হয়েছে। |
| 3 | 13.39 | একবার *dispatch* | এবার স্ক্রিনে দেখো, অর্ডার নম্বর ১০৪২। Checkout থেকে মাত্র একবার OrderPlaced dispatch হলো। Laravel-এর event dispatcher দেখে, এই event-এর জন্য কোন কোন listener আছে। আমাদের উদাহরণে আছে দুটো। |
| 4 | 10.33 | Listener ১: *Email* | প্রথম listener হলো SendOrderConfirmation। এর handle method event থেকে অর্ডারটা নেয়, তারপর customer-কে ইমেইল পাঠায়—“আপনার অর্ডার নম্বর ১০৪২।” |
| 5 | 10.04 | Listener ২: *দোকান* | দ্বিতীয় listener হলো NotifyShop। সেও একই event থেকে একই অর্ডার পায়। এবার খবরটা যায় দোকানদারের কাছে—“নতুন অর্ডার ১০৪২ প্রস্তুত করুন।” |
| 6 | 5.05 | *Warehouse*-কেও? | এবার শুরুর প্রশ্নটায় ফিরি। Warehouse-কেও খবর দিতে হলে কোন জায়গায় code লিখব? |
| 7 | 16.36 | *#1043* → ৩ listener | NotifyWarehouse নামে আরেকটা listener যোগ করব, আর সেটাকে OrderPlaced-এর সঙ্গে যুক্ত করব। পরের অর্ডার, ১০৪৩, তৈরি হলে checkout আগের মতোই একবার event dispatch করবে। এবার ওই এক অর্ডারের খবর পাবে তিনটি listener। |
| 8 | 14.72 | একই *Observer* ধারণা | আগের পর্বে Weather Station নিজেই display-গুলোর তালিকা রাখত। এখানে সেই সংযোগ সামলায় Laravel-এর event dispatcher। Observer Pattern-এর ধারণাটা একই—এক জায়গায় কিছু ঘটলে, যারা সেই খবরে আগ্রহী তারা প্রত্যেকে নিজের কাজটা করে। |
| 9 | 12.08 | *Event* + *Listener* | নিজের প্রজেক্টে ভাবো—অর্ডার তৈরি হয়েছে একবার, কিন্তু তার পরে দলের তিনজনের তিন রকম কাজ। অর্ডার তৈরি হওয়ার ঘটনাটা event-এ রাখো, আর প্রতিটা কাজের নিয়ম রাখো তার নিজের listener-এ। |

## Edit
- Scenes: `src/stories/design-patterns/observer-p2/Scenes.tsx` (Part 1 pieces reused for the recap)
- Captions: `npm run align-captions -- design-patterns/observer-p2-bn`
- Render: `npm run render -- design-patterns/observer-p2-bn` · Thumbnail: `npm run thumbs:patterns`
