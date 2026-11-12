# Strategy Pattern পর্ব ১: Rubber Duck কেন উড়ছে?

- Format: 9:16, 1080×1920, 30 fps, ~49s, Bangla (Banglish tech terms)
- Voiceover: recordings/design-patterns/strategy-p1.mp3 (ElevenLabs), cut per scene, captions aligned with Whisper
- Visuals: original 2D motion graphics — dark navy, teal/blue accents, orange = problem
- Code: plain PHP only, 4–6 lines per shot

| # | Scene | Voiceover |
|---|-------|-----------|
| 1 | Opening — rubber duck flying | একটা রাবারের হাঁস উড়ছে! আমাদের কোডে এমন ভুল কীভাবে হলো? |
| 2 | Duck → MallardDuck, RubberDuck (extends) | ধরো, PHP দিয়ে একটা Duck simulator বানাচ্ছি। Parent class Duck, আর MallardDuck ও RubberDuck দুটোই তাকে extend করে। |
| 3 | fly() in parent → both fly | এবার হাঁসগুলোকে ওড়াতে Duck class-এ fly() method যোগ করলাম। কিন্তু RubberDuck-ও সেই method inherit করলো। ফলে রাবারের হাঁসও উড়ছে। |
| 4 | Override in RubberDuck (valid temporary fix) | তাহলে RubberDuck-এ fly() override করে ওড়া বন্ধ করি? হ্যাঁ, আপাতত তো ঠিক হলো। |
| 5 | More duck types, duplicate code | কিন্তু হাঁসের ধরন বাড়লে আলাদা flying behavior বিভিন্ন subclass-এ সামলাতে হবে। একই flying code কয়েক জায়গায় থাকলে পরিবর্তনও কয়েক জায়গায় লাগে। |
| 6 | Takeaway | সব হাঁস Duck হলেও, সবার ওড়ার আচরণ এক নয়। |
| 7 | Ending + next episode | তাহলে ওড়ার আচরণটাকে আলাদা করে রাখলে কেমন হয়? পরের পর্বে এভাবেই Strategy Pattern বুঝবো। |

## Edit
- Scene animations + code: `src/stories/design-patterns/strategy-p1/Scenes.tsx` (beat times in seconds per scene)
- Reusable parts: `src/tech/` (CodePanel, Duck, ClassBox/ExtendsArrow/Tag)
- Text, captions, timing: `public/projects/design-patterns/strategy-p1-bn/scenes.json`
- Preview live: `npm run studio` → composition "Short", paste `out/strategy-p1-bn.props.json` as props
- Render: `npm run render -- design-patterns/strategy-p1-bn`
