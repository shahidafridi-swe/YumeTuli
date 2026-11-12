# Database Index কেন Query Fast করে? — recording script

**Upay A (sohoj, recommended):** protita scene alada file e record koro — 1.m4a, 2.m4a, … Bhul hole shudhu oi file ta abar record koro.
**Upay B:** ek take e puro ta poro, **protita scene er por 2 second chup** (mone mone 1-2 gono). Majhe retake korle split bhul hobe — tokhon Upay A.
Nijer moto kore bolo — shobdo ektu bodlale somossa nei. Shanto ghor, phone mukh theke ek hat dure.

## Scene 1  ·  screen: Query: ৫ সেকেন্ড 😱

তোমার users table এ দশ লাখ row. আর একটা simple query নিচ্ছে প্রায় পাঁচ সেকেন্ড!

⏸ *2 second chup*

## Scene 2  ·  screen: Full Table Scan

কারণ index ছাড়া database প্রতিটা row একটা একটা করে চেক করে। এটাকে বলে Full Table Scan.

⏸ *2 second chup*

## Scene 3  ·  screen: বই vs সূচিপত্র

ভাবো, একটা মোটা বইয়ে একটা শব্দ খুঁজছো। প্রথম পাতা থেকে পড়বে, নাকি পেছনের সূচিপত্র দেখবে?

⏸ *2 second chup*

## Scene 4  ·  screen: Index = B-Tree

Database index ঠিক এই সূচিপত্র। এটা data কে sorted B-Tree তে রাখে, তাই মাত্র কয়েক ধাপেই row পাওয়া যায়।

⏸ *2 second chup*

## Scene 5  ·  screen: মাত্র ১ লাইন

Index বানানো খুব সহজ। শুধু এক লাইনের command.

⏸ *2 second chup*

## Scene 6  ·  screen: ৪৮২৩ms → ৩ms ⚡

এবার সেই একই query, মাত্র তিন মিলিসেকেন্ড! প্রায় দেড় হাজার গুণ fast.

⏸ *2 second chup*

## Scene 7  ·  screen: Index এর trade-off

তবে সাবধান! Index insert আর update কে একটু slow করে, আর extra জায়গা নেয়। তাই শুধু দরকারি column এ index দাও।

⏸ *2 second chup*

## Scene 8  ·  screen: Follow করো 🚀

এমন আরও tech tips পেতে follow করো!

⏸ *2 second chup*
