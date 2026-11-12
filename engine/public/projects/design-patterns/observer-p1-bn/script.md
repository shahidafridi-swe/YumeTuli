# Dev Diary — Observer Pattern in PHP, পর্ব ১

Voiceover: `recordings/design-patterns/observer-p1.mp3` (103.2s), user script (expression tags = delivery only). Scene 6 holds 1.2s on the result; scene 8 holds 1.5s.

Runnable PHP: `source/weather.php` → prints `Current: 33°C`, `History: [30, 32]`, `PASS`.

| # | sec | On screen | Voiceover |
|---|---|---|---|
| 1 | 9.73 | নতুন *display*, নতুন code? | Weather Station-এ একটা নতুন display লাগালাম। এখন থেকে তাপমাত্রা বদলালেই সেটায় নতুন reading দেখাতে হবে। এজন্য কি প্রতিবার station-এর code খুলতে হবে? |
| 2 | 15.11 | সরাসরি *call* | ধরো, আমাদের station সরাসরি দুটো display-কে update করে। একটা দেখায় এখন কত ডিগ্রি, আরেকটা রাখে তাপমাত্রার history। কাল তৃতীয় একটা display যোগ হলে station-এর ভেতরে আরেকটা call লিখতে হবে। একটা খুলে ফেললেও সেই code বদলাতে হবে। |
| 3 | 8.69 | Station-এর কাজ *মাপা* | অথচ station-এর কাজ তো তাপমাত্রা মাপা। কোন display সংখ্যাটা দেখাবে আর কোনটা graph আঁকবে, সেটা station-এর জানার দরকার কী? |
| 4 | 16.31 | *Observer* interface | PHP-তে একটা Observer interface বানাই। সেখানে update নামে একটা method থাকবে, যেটা নতুন তাপমাত্রা নেবে। দুটো display-ই এই method নিজের মতো করে লিখবে। আর যে display খবর পেতে চায়, সে station-এ subscribe করবে। Station শুধু তাদের একটা তালিকা রাখবে। |
| 5 | 17.72 | *৩২°C* সবার কাছে | এবার দেখো। তাপমাত্রা ৩০ থেকে ৩২ ডিগ্রি হলো। Station তালিকার প্রত্যেকের update method-এ ৩২ পাঠাল। প্রথম display-তে সংখ্যাটা বদলে গেল। আর history graph-এ? সেখানে ৩০-এর পাশেই ৩২-এর একটা নতুন বিন্দু যোগ হলো। একই খবর পেয়ে দুটো display দুটো আলাদা কাজ করল। |
| 6 | 13.28 | *unsubscribe* | এবার history display-টা unsubscribe করি। তাপমাত্রা হলো ৩৩ ডিগ্রি। প্রথম display-তে ৩৩ দেখা যাচ্ছে, কিন্তু graph-এর শেষ বিন্দু এখনও ৩২। কারণ history display এবার আর খবর পায়নি। |
| 7 | 15.69 | *Observer* Pattern | এটাই Observer Pattern। এখানে Weather Station হলো subject, আর যে display-গুলো খবরের জন্য নাম লিখিয়েছে, তারা হলো observer। নতুন display যোগ করতে হলে সেটাকে update করতে শেখাও আর subscribe করাও। Station-এর খবর পাঠানোর code একই থাকবে। |
| 8 | 9.43 | পরের পর্ব: *Laravel* | পরের পর্বে এই ধারণাটাই Laravel-এ দেখব—একটা OrderPlaced event থেকে কীভাবে customer আর দোকান, দুজনকেই জানানো যায়। |

## Edit
- Scenes (station, displays, graph, links, code): `src/stories/design-patterns/observer-p1/Scenes.tsx`
- Theme: ivory `#FAF7EF`, charcoal `#25232A`, plum `#702963` (observer link), burnt orange `#B84A20` (temperature)
- Captions: `npm run align-captions -- design-patterns/observer-p1-bn`
- Render: `npm run render -- design-patterns/observer-p1-bn`
