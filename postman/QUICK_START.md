# 🚀 راهنمای سریع شروع

## ⚡ تست فوری در 5 دقیقه

### 1. **Import فایل‌ها**
```
✅ ProductPlus_API_Collection.json
✅ ProductPlus_Server_Environment.json (برای سرور)
✅ ProductPlus_Local_Environment.json (برای لوکال)
```

### 2. **انتخاب Environment**
- برای سرور: **ProductPlus Server Environment**
- برای لوکال: **ProductPlus Local Environment**

### 3. **تست سریع**
```
1. 💚 Health Check - بررسی وضعیت سرور
2. 👤 ثبت نام کاربر جدید
3. 🔑 ورود کاربر
4. 📋 دریافت لیست محصولات
```

## 🔥 تست اولیه (2 دقیقه)

### Health Check
```
GET {{base_url}}/health
Expected: 200 OK
```

### ثبت نام
```
POST {{base_url}}/api/auth/register
Body: {
  "name": "کاربر تست",
  "email": "test@example.com",
  "password": "123456",
  "phone": "09123456789"
}
Expected: 201 Created
```

### ورود
```
POST {{base_url}}/api/auth/login
Body: {
  "email": "test@example.com",
  "password": "123456"
}
Expected: 200 OK + Token
```

### دریافت محصولات
```
GET {{base_url}}/api/products
Expected: 200 OK + List of products
```

## ⚠️ اگر خطا دریافت کردید

### خطای 404
- URL را بررسی کنید
- سرور را restart کنید

### خطای 500
- لاگ‌های سرور را بررسی کنید
- دیتابیس را بررسی کنید

### خطای CORS
- سرور را restart کنید
- Environment را بررسی کنید

## 📱 تست با موبایل

### Postman Mobile App
1. Postman Mobile را نصب کنید
2. Collection را sync کنید
3. Environment را انتخاب کنید
4. تست کنید

## 🎯 تست‌های پیشرفته

### Load Testing
```
1. Collection Runner را باز کنید
2. Iterations: 10
3. Delay: 1000ms
4. Run کنید
```

### Automated Testing
```
1. Tests tab را باز کنید
2. Validation scripts بنویسید
3. Collection Runner را اجرا کنید
```

---

**💡 نکته:** ابتدا Health Check را تست کنید تا از اتصال سرور اطمینان حاصل کنید!
