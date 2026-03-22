# 🚀 CraftCost Pro — دليل الإعداد

## الملفات داخل هذا المجلد (ارفعها كلها على GitHub)

```
index.html     ← التطبيق الكامل
sw.js          ← يعمل بدون إنترنت
manifest.json  ← إعدادات PWA
icon.png       ← أيقونة 192×192
icon-512.png   ← أيقونة 512×512
```

---

## رفعه على GitHub Pages (بدون أي برامج)

1. افتح مستودعك على GitHub
2. اضغط **Add file** ← **Upload files**
3. اسحب الـ 5 ملفات وأفلتها
4. اضغط **Commit changes**
5. اذهب لـ **Settings** ← **Pages** ← **main** ← **/ (root)** ← **Save**

---

## كود الدخول التجريبي

```
CRAFTDEMO
```

---

## لوحة الإدارة

- افتح التطبيق
- اضغط **الإدارة** في القائمة الجانبية (بعد الدخول)
- كلمة السر الافتراضية: **advax2025**

### من لوحة الإدارة تستطيع:
- إنشاء أكواد اشتراك جديدة
- تحديد مدة كل كود (شهر / 3 أشهر / سنة)
- إيقاف أي كود
- إرسال إشعارات للمستخدمين

---

## تغيير كلمة سر الإدارة

افتح ملف `index.html` بأي محرر نصوص
ابحث عن: `ADMIN_PASS: 'advax2025'`
غيّرها لأي كلمة سر تريدها

---

## ربط Supabase (اختياري — للأكواد السحابية)

بدون Supabase: الأكواد تُحفظ محلياً في نفس الجهاز فقط
مع Supabase: الأكواد تعمل عبر الإنترنت لجميع المستخدمين

### خطوات Supabase:
1. افتح [supabase.com](https://supabase.com) وأنشئ مشروع مجاني
2. اذهب لـ SQL Editor وشغّل هذا الكود:

```sql
CREATE TABLE subscription_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  label TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO subscription_codes (code, label, expires_at)
VALUES ('CRAFTDEMO', 'كود تجريبي', NOW() + INTERVAL '1 year');
```

3. من Settings > API انسخ الـ URL والـ anon key
4. في `index.html` ابحث عن:
```
SUPABASE_URL: '',
SUPABASE_KEY: '',
```
وضع قيمك بدلاً من ''

---

## AdVax © 2025
