# hizibizi · Why Is That? — পর্ব ১: ব্যাগের চেইন এক টানে বন্ধ হয় কীভাবে?

Voiceover: `recordings/hizibizi/zipper.mp3` (66.7s), script transcribed from the audio. 6 scenes; scene 6 has a 2.2s hold for the final bag shot.

| # | sec | Visual | Voiceover |
|---|---|---|---|
| 1 | 10.57 | Bag zipper closes, freezes half-way (open teeth above, joined below) | ব্যাগের চেইনটা টানতেই বন্ধ হয়ে গেলো। কিন্তু খেয়াল করেছো? তুমি টান দিলে এক জায়গায়, আর একটার পর একটা দাঁত ঠিক নিজের জায়গায় বসে গেলো কীভাবে? |
| 2 | 9.89 | Pull tab highlight → zoom into slider → body turns see-through | চলো, চেইনটা অর্ধেক টেনে থামাই। যে ছোট্ট হাতলটা ধরে টানলে, তার নিচে এই অংশটা দেখছো? এটাই স্লাইডার। এবার এর ভেতরটা দেখি। |
| 3 | 10.54 | Top view Y channel: blue row left, yellow row right, two roads merge into one | স্লাইডারের ভেতরের পথটা ইংরেজি Y-এর মতো। চওড়া মুখে দুটো আলাদা রাস্তা। একটু ভেতরে গেলেই রাস্তা দুটো মিশে একটাই সরু পথ হয়ে গেছে। |
| 4 | 10.98 | Follow one blue tooth (slow motion); gap between two yellow teeth | এবার বাঁ পাশের এই নীল দাঁতটায় চোখ রাখো। স্লাইডারটা টানছি। দেখো, নীল দাঁতটার ঠিক সামনে একটা ফাঁক, ডান পাশের দুই হলুদ দাঁতের মাঝখানে। |
| 5 | 12.73 | Walls squeeze rows; blue tooth locks; next teeth lock; zoom out | পথটা যতো সরু হচ্ছে, দুই সারি ততো কাছে আসছে। এবং নীল দাঁতটা ওই ফাঁকে ঢুকে আটকে গেলো। স্লাইডারটা আরেকটু এগোতেই পরের দাঁতটাও বসে গেলো। এভাবেই পুরো চেইন বন্ধ হয়। |
| 6 | 14.9 | Same angle, slider reversed; divider splits rows; same blue tooth unlocks; back to bag | এবার উল্টো দিকে টানি। জোড়া দাঁতগুলো এবার সরু মুখ দিয়ে ঢুকছে। মাঝখানের ভাগটা দুই সারিকে দুই দিকে সরিয়ে দিচ্ছে। একটু আগেই যে নীল দাঁতটা আটকে ছিলো, দেখো, সেটা আবার আলাদা হয়ে গেলো। |

## Edit
- Zipper drawing (one world, camera zooms): `src/stories/hizibizi/zipper/Zipper.tsx`
- Scenes, camera + slider keyframes, labels: `src/stories/hizibizi/zipper/Scenes.tsx`
- Captions/timing: `scenes.json` (`npm run align-captions -- hizibizi/zipper-bn`)
- Zipper sound: `assets/sfx-events.json` → `.venv/bin/python -I scripts/zip-sfx.py assets/sfx-events.json assets/zip-sfx.wav <total-sec>`
- Render: `npm run render -- hizibizi/zipper-bn`
- Thumbnail: `src/thumbs/HizibiziThumbs.tsx` → `npm run thumbs:hizibizi`
