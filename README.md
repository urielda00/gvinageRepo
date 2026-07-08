# GVINAAGE — לוח בקרה להזמנות

דשבורד React + Vite בעברית להזמנות ולוגים מ-Supabase.

## הגדרה והרצה

1. ודאו שקובץ הלוגו נמצא ב-`public/gvinage-logo-transparent.png`.
2. צרו קובץ `.env` והוסיפו:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

3. הריצו:

```bash
npm install
npm run dev
```

האפליקציה משתמשת רק במפתח anon. עדכון ומחיקת הזמנות יתבצעו רק אם מדיניות RLS ב-Supabase מאפשרת זאת למשתמש המחובר.
