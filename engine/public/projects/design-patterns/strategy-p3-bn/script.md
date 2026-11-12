# Strategy Pattern পর্ব ৩ (final) — Checkout-এ Delivery Fee

Voiceover: `recordings/design-patterns/strategy-p3.mp3` (152s), script transcribed from the audio and split into 11 scenes. Same order, same 4 km in every scene.

Runnable source: `source/checkout.php` (plain PHP), `source/verify.php` (checks every number on screen), `source/laravel/CheckoutController.php` (Laravel controller).

| # | sec | On screen | Voiceover |
|---|---|---|---|
| 1 | 11.9 | এক click-এ *৳60* → *৳100* | একই অর্ডার, একই ঠিকানা। Standard delivery বেছে নিলে চার্জ ৬০ টাকা। Express-এ চাপ দিতেই হয়ে গেল ১০০ টাকা। এই এক click-এর পর আমাদের Laravel app-এ আসলে কী ঘটলো? |
| 2 | 18.01 | Express-এর *হিসাব* | ধরো, দোকান থেকে বাসার দূরত্ব ৪ কিলোমিটার। আমাদের দোকানে Standard delivery charge সবসময় ৬০ টাকা। Express-এর নিয়ম একটু আলাদা: শুরুতে ৬০ টাকা, তারপর প্রতি কিলোমিটারে আরও ১০ টাকা। তাই ৪ কিলোমিটারের জন্য Express charge দাঁড়ায় ৬০ যোগ ৪০, অর্থাৎ ১০০ টাকা। |
| 3 | 16.91 | *if/else*-এ সব নিয়ম | এই দুই নিয়ম একটা if/else দিয়েই লেখা যায়। এখন ধরো দোকান Same Day delivery চালু করলো, সেটার charge আবার অর্ডারের সময়ের ওপর নির্ভর করে। পরের মাসে শুধু Express-এর rate বাড়ালো। সব হিসাব এক method-এ থাকলে, একটা নিয়ম বদলাতেও আমাদের সেই একই method খুলতে হয়। |
| 4 | 11.01 | প্রশ্ন *একই*, নিয়ম *আলাদা* | এখানে খেয়াল করো, checkout প্রতিবার একই প্রশ্ন করছে: এই অর্ডারে delivery charge কত? শুধু উত্তর বের করার নিয়মটা বদলাচ্ছে। এই নিয়মগুলোকেই আমরা আলাদা strategy বানাবো। |
| 5 | 16.16 | *Strategy* interface | PHP-তে প্রথমে একটা interface লিখি: DeliveryStrategy। এতে একটাই method রাখি: fee। এই উদাহরণে fee দূরত্ব নেয়, আর পূর্ণ টাকায় charge ফেরত দেয়। Interface-টা বলে দেয় checkout কীভাবে হিসাব চাইবে। হিসাবের সূত্রটা থাকবে প্রতিটি class-এর ভেতরে। |
| 6 | 13.52 | দুটো *strategy* class | এবার StandardDelivery আর ExpressDelivery, দুটো class ওই interface implement করবে। StandardDelivery-র fee সবসময় ৬০ ফেরত দেবে। ExpressDelivery-র fee দূরত্বকে ১০ দিয়ে গুণ করে, তার সঙ্গে ৬০ যোগ করে। |
| 7 | 14.33 | Click → *Controller* | এবার সেই click-এ ফিরে যাই। Customer Express বাছলো। Laravel controller প্রথমে যাচাই করে নেয়, Express আমাদের অনুমোদিত delivery option কিনা। তারপর ExpressDelivery object CheckoutService-কে দেয়। Screen-এ এই line-টা দেখো। |
| 8 | 17.83 | Service → *fee()* | Checkout তার strategy-র fee method-কে ৪ কিলোমিটার পাঠাচ্ছে। এবার strategy হলো ExpressDelivery, তাই ফল ১০০। Customer Standard বাছলে একই line-এ একই ৪ কিলোমিটার যেতো, কিন্তু StandardDelivery উত্তর দিতো ৬০। কোন সূত্র ব্যবহার হলো, সেটা checkout-এর জানার দরকারই পড়লো না। |
| 9 | 15.97 | Rate *10 → 15* | তাহলে লাভটা কোথায়? কাল Express-এর প্রতি কিলোমিটার rate ১০ থেকে ১৫ টাকা হলে, শুধু ExpressDelivery-র হিসাবটুকু বদলাবো। একই ৪ কিলোমিটারে এবার charge হবে ১২০ টাকা। Standard-এর হিসাব আর checkout-এর ওই method, দুটোই আগের মতো কাজ করবে। |
| 10 | 10.41 | একই *Pattern* | আগের পর্বে Duck ওড়ার কাজটা দিয়েছিল FlyBehavior-কে। আজ CheckoutService ভাড়া হিসাবের কাজটা দিলো DeliveryStrategy-কে। নিজের project-এ সিদ্ধান্ত নিতে এভাবে মিলিয়ে দেখো। |
| 11 | 11.15 | কখন *Strategy*? | শুধু একটা নির্দিষ্ট charge থাকলে config-এই রাখা যায়। আর একই কাজের কয়েকটা নিয়ম যখন আলাদাভাবে বদলায়, তখন Strategy Pattern কাজে আসে। |

## Edit
- Animations + on-screen code: `src/stories/design-patterns/strategy-p3/Scenes.tsx`
- Checkout UI + trace bar: `src/tech/Checkout.tsx`
- Text, timing, captions: `scenes.json`. Re-sync captions: `npm run align-captions -- design-patterns/strategy-p3-bn` (fix a garbled spot first: `scripts/splice-words.sh strategy-p3-bn <scene> <from> <to> [bn|en]`)
- Render: `npm run render -- design-patterns/strategy-p3-bn`
