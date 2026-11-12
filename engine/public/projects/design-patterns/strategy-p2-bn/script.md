# Strategy Pattern পর্ব ২ — Strategy Pattern দিয়ে সমাধান

Voiceover: `recordings/design-patterns/strategy-p2.mp3` (68s) — script transcribed from the audio, split into 9 scenes.
Full runnable PHP: `source/strategy.php` (`php source/strategy.php`).

| # | sec | On screen | Voiceover |
|---|---|---|---|
| 1 | 7.59 | ওড়ার আচরণ *আলাদা* | রাবারের হাঁস ওড়ে না, কিন্তু আসল হাঁস ওড়ে। একই Duck family-তে এই আলাদা আচরণ কীভাবে সামলাবো? |
| 2 | 7.98 | *FlyBehavior* interface | ওড়ার আচরণটাকে Duck থেকে আলাদা করে PHP-তে একটা interface বানাই, FlyBehavior। এর মধ্যে থাকবে fly() method। |
| 3 | 8.5 | দুটো *Strategy* class | তারপর দুটো class এই interface implement করবে। FlyWithWings বলবে, ডানা দিয়ে উড়ছি, আর FlyNoWay বলবে, আমি উড়তে পারি না। |
| 4 | 5.9 | Duck *has-a* FlyBehavior | এবার Duck নিজে ওড়ার নিয়ম লেখে না। সে একটা FlyBehavior object রাখে। |
| 5 | 7.5 | কাজ দিয়ে দেয়: *delegation* | Duck-এর performFly() call করলে সে ওই object-এর fly() method-কে কাজটা দিয়ে দেবে। এটাকে বলে delegation। |
| 6 | 7.64 | যার যেটা *দরকার* | MallardDuck-কে দেবো FlyWithWings, RubberDuck-কে দেবো FlyNoWay। একই flying behavior অন্য হাঁসেও reuse করা যাবে। |
| 7 | 9.44 | *Runtime*-এ বদল | আর পরে behavior বদলাতে চাইলে setter দিয়ে নতুন behavior object বসিয়ে দিলেই হবে। Duck object একই থাকবে, কিন্তু তার ওড়ার আচরণ বদলে যাবে। |
| 8 | 13.8 | *Strategy* Pattern | এটাই Strategy Pattern: একই কাজের বিভিন্ন পদ্ধতি আলাদা object-এ রাখা, আর প্রয়োজনমতো বেছে নেওয়া। Duck হলো Context, FlyBehavior হলো Strategy interface, আর flying class-গুলো concrete strategy। |
| 9 | 4.5 | পরের পর্বে *বাস্তব* কাজে | পরের পর্বে দেখবো বাস্তব কাজে এর ব্যবহার। |

## Edit
- Animations + on-screen code: `src/stories/design-patterns/strategy-p2/Scenes.tsx` (beat times in seconds per scene)
- Reusable parts: `src/tech/` (CodePanel, Duck, ClassBox/Arrow/Tag)
- Text, timing, captions: `scenes.json` — re-sync captions: `npm run align-captions -- design-patterns/strategy-p2-bn`
- Render: `npm run render -- design-patterns/strategy-p2-bn`
