# hizibizi · Why Is That? — পর্ব ৩: চামচের ভেতরের পিঠে নিজের মুখ উল্টো দেখো কেন?

Full-screen style (no card). Voiceover: `recordings/hizibizi/spoon.mp3` (67.2s), user script; expression tags are delivery only. Scene 6 has a 1.5s hold.

| # | sec | Voiceover |
|---|---|---|
| 1 | 12.63 | একটা চকচকে চামচ নাও। যেদিক দিয়ে স্যুপ খাও, সেই দিকটা মুখের সামনে ধরো। একটু দূর থেকে তাকাও তো… তোমার থুতনি উপরে, চুল নিচে! চামচটা তো সোজাই আছে। তাহলে উল্টো হলো কেন? |
| 2 | 11.98 | এবার চামচটা না ঘুরিয়ে ধীরে ধীরে মুখের খুব কাছে আনো। দেখলে? মুখটা আবার সোজা! আর বেশ বড়ও লাগছে। একই চামচে দুটো এমন আলাদা ছবি কীভাবে? |
| 3 | 9.29 | চামচের ভেতরের পিঠটা বাটির মতো বাঁকা। তাই মুখ থেকে আলো এসে চামচের কোথায় পড়ছে, তার ওপর নির্ভর করে আলো কোন দিকে ফিরে যাবে। |
| 4 | 16.97 | ধরো, এই হলুদ রেখাগুলো তোমার কপাল থেকে আসা আলো। আর নীলগুলো থুতনি থেকে। একটু দূরে থাকলে কী হয় দেখো। চামচে ধাক্কা খেয়ে কপালের আলোগুলো নিচের দিকে এসে মেলে। থুতনির আলোগুলো মেলে উপরের দিকে। তাই ছবিতে কপাল নিচে, থুতনি উপরে! |
| 5 | 11.64 | আর একদম কাছে আনলে? তখন একই জায়গা থেকে আসা আলোগুলো চামচ থেকে ফিরে ছড়িয়ে যায়। তোমার চোখে মনে হয়, আলো আসছে চামচের পেছনে একটা বড়, সোজা মুখ থেকে। |
| 6 | 7.08 | এবার চামচটা আবার দূরে সরাও তো। ঠিক কখন তোমার মুখটা উল্টে যায়, ধরতে পারো? |

## Edit
- Scenes + ray geometry (real concave-mirror reflection): `src/stories/hizibizi/spoon/Scenes.tsx`
- Captions: shadow style (`theme.caption_style: "shadow"`), `npm run align-captions -- hizibizi/spoon-bn`
- Sound (spoon ting + room tone): `assets/sfx-events.json` → `.venv/bin/python -I scripts/zip-sfx.py assets/sfx-events.json assets/sfx.wav 69.6`
- Render: `npm run render -- hizibizi/spoon-bn` · Thumbnail: `npm run thumbs:hizibizi`