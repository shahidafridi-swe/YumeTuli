# hizibizi · Why Is That? — পর্ব ২: শরবত লাল, কিন্তু গ্লাসের বাইরের ফোঁটা স্বচ্ছ কেন?

Voiceover: `recordings/hizibizi/sorbot.mp3` (62.7s), user script (expression tags are delivery only, not in captions). Scene 5 has a 1.5s hold.

| # | sec | Voiceover |
|---|---|---|
| 1 | 14.75 | বরফ দেওয়া লাল শরবতের গ্লাসটা একটু আগে মুছে রাখলাম। এই দেখো, আবার ভিজে গেছে! একটা ফোঁটা আঙুলে নিয়ে দেখি… একদম স্বচ্ছ। ভেতরের শরবত যদি লাল হয়, বাইরের পানিটা এল কোথা থেকে? |
| 2 | 14.07 | চলো, একটা ছোট্ট পরীক্ষা করি। পাশাপাশি দুটো শুকনো গ্লাস রাখি। দুটোতেই একই লাল শরবত। একটায় বরফ দিই, আরেকটা ঘরের তাপমাত্রায় রাখি। একটু পরে দেখো… শুধু ঠান্ডা গ্লাসটার গায়েই ফোঁটা জমেছে! |
| 3 | 16.99 | এবার গ্লাসের ঠিক বাইরের বাতাসটুকু দেখি। এই বাতাসে পানি আছে, জলীয় বাষ্প হয়ে। চোখে দেখা যায় না। ঠান্ডা গ্লাসের গায়ে লেগে বাতাসটা ঠান্ডা হয়। যথেষ্ট ঠান্ডা হলে সেই বাষ্পের কিছুটা তরল পানি হয়ে কাচের গায়ে জমে। একেই বলে ঘনীভবন। |
| 4 | 6.7 | এই যে ছোট্ট দুটো ফোঁটা, খেয়াল করো… মিলে একটা বড় ফোঁটা হলো। এবার সেটা গড়িয়ে পড়ছে! |
| 5 | 12.56 | তাহলে রহস্যটা ধরতে পেরেছো? লাল রংটা শরবতের সঙ্গে গ্লাসের ভেতরেই আছে। আর তোমার আঙুলে যে পানিটা লেগেছিল? একটু আগেও সেটা ছিল তোমার চারপাশের বাতাসে! |

## Edit
- Scenes: `src/stories/hizibizi/sorbot/Scenes.tsx` · shared stage/labels: `src/stories/hizibizi/common.tsx`
- Captions/timing: `scenes.json` (`npm run align-captions -- hizibizi/sorbot-bn`)
- Ice clink: `assets/sfx-events.json` → `.venv/bin/python -I scripts/zip-sfx.py assets/sfx-events.json assets/sfx.wav 65.1`
- Render: `npm run render -- hizibizi/sorbot-bn`
