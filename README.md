# شغف
1. `cp .env.example .env` واملأ القيم  2. شغّل `supabase.sql` في Supabase SQL Editor  3. `npm i && npm run dev`
## هيكل Drive (كل الأسماء حرة، والموقع بيقرأ الفولدرات تلقائيًا)
الجذر ← النظام (جديد/قديم) ← السنة ← الترم ← المادة ← (الشرح | المراجعات) ← ملفات PDF
الفولدر اللي اسمه فيه "مراجع" بيتعامل كمراجعات. الاختبار: ملف JSON جنب الـPDF بنفس اسمه + `.quiz.json`
مثال: `الدرس 1.pdf` و `الدرس 1.quiz.json` بالشكل: `[{"q":"السؤال","options":["أ","ب","ج"],"answer":1}]`
## الأدمن
أنشئ حساب الأدمن من Supabase → Authentication → Users، وعطّل Sign-ups (Providers → Email) عشان محدش غيرك يسجل.
