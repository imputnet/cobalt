# دليل الإجراءات السريعة - Quick Reference
**للاستخدام السريع عند حدوث مشاكل**

---

## ⚡ الخطأ الشهير #1: WEB_DEFAULT_API

```bash
❌ الخطأ:
WEB_DEFAULT_API env variable is required, but missing

✅ الحل الفوري:
1. cd /vercel/share/v0-project/web
2. echo "WEB_DEFAULT_API=https://api.cobalt.tools" > .env
3. echo "PUBLIC_DEFAULT_API=https://api.cobalt.tools" >> .env
4. pnpm dev

🔍 التحقق:
cat .env
pnpm dev  # يجب أن يعمل
```

---

## ⚡ الخطأ الشهير #2: Port Already in Use

```bash
❌ الخطأ:
Error: listen EADDRINUSE: address already in use :::5173

✅ الحل الفوري:
# طريقة 1: استخدام منفذ مختلف
PORT=5174 pnpm dev

# طريقة 2: إيقاف العملية الأخرى
lsof -i :5173
kill -9 <PID>
pnpm dev
```

---

## ⚡ الخطأ الشهير #3: Dependencies Not Found

```bash
❌ الخطأ:
Cannot find module 'package-name'

✅ الحل الفوري:
pnpm install
pnpm dev
```

---

## 📋 قائمة الفحص السريعة (30 ثانية)

```
[ ] هل ملف .env موجود؟
    ls -la /vercel/share/v0-project/web/.env

[ ] هل المتغيرات محددة؟
    cat /vercel/share/v0-project/web/.env

[ ] هل الخادم يعمل؟
    ps aux | grep pnpm

[ ] هل المنفذ مفتوح؟
    curl http://localhost:5173
```

---

## 🚀 إعادة البدء من الصفر

```bash
# 1. انتقل للمشروع
cd /vercel/share/v0-project/web

# 2. نظف كل شيء
rm -rf node_modules .pnpm-store build dist

# 3. أعد التثبيت
pnpm install

# 4. أعد البناء
pnpm build

# 5. ابدأ الخادم
pnpm dev
```

---

## 🔧 أوامر التشخيص المهمة

| المشكلة | الأمر | النتيجة |
|--------|------|--------|
| عرض المتغيرات | `env \| grep -E "WEB_\|PUBLIC_"` | قائمة المتغيرات |
| فحص الملف | `cat .env` | محتوى .env |
| فحص العملية | `ps aux \| grep pnpm` | حالة الخادم |
| اختبار المنفذ | `lsof -i :5173` | العملية على المنفذ |
| اختبار الاتصال | `curl http://localhost:5173` | استجابة الخادم |

---

## 📝 ملفات مهمة للمراجعة

```
.env
  ↓ يحتوي على متغيرات البيئة

web/vite.config.ts
  ↓ يحدد المتغيرات المطلوبة

web/package.json
  ↓ يحتوي على الأوامر (dev, build, preview)

README.md
  ↓ توثيق المشروع
```

---

## ✅ علامات النجاح

```
✓ الخادم يعمل على http://localhost:5173
✓ لا توجد أخطاء في الكونسول
✓ يمكن الوصول للصفحة الرئيسية
✓ الشعار والألوان الجديدة تظهر بشكل صحيح
✓ جميع الميزات تعمل بدون مشاكل
```

---

## ❌ علامات الفشل

```
✗ خطأ في البناء (Build Error)
✗ المنفذ مشغول (Port Already in Use)
✗ متغير بيئة مفقود (Env Variable Missing)
✗ صفحة بيضاء / لا محتوى
✗ أخطاء في الكونسول (Console Errors)
```

---

## 🎯 النقاط الحرجة

```
1. ملف .env يجب أن يكون موجوداً
2. المتغيرات يجب أن تكون محددة
3. الخادم يجب أن يبدأ بدون أخطاء
4. المنفذ 5173 يجب أن يكون حراً
```

---

**آخر تحديث:** 2026-04-17
