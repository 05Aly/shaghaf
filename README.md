# شغف
## التشغيل
1. `npm i` ثم انسخ `.env.example` إلى `.env` واملأه. بعدها `npm run dev` (الـ /api شغال محليًا).
2. شغّل `supabase.sql` في Supabase SQL Editor. أنشئ حساب الأدمن من Authentication ← Users (Auto Confirm) وعطّل Sign-ups.
3. النشر على Vercel: ارفع المشروع (بدون node_modules) وضع المتغيرات الأربعة في Environment Variables ثم Redeploy.
## Drive
الفولدر لازم يكون: Share ← General access ← Anyone with the link ← Viewer.
الهيكل: الجذر ← النظام ← السنة ← الترم ← المادة ← (الشرح | المراجعات) ← PDF. أي فولدر اسمه فيه "مراجع" = مراجعات.
الاختبار: ملف بجانب الـPDF بنفس الاسم + `.quiz.json`، مثال `الدرس 1.pdf` و `الدرس 1.quiz.json`:
`[{"q":"السؤال","options":["أ","ب","ج"],"answer":1,"explain":"شرح اختياري"}]`
