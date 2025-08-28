# 🧪 راهنمای تست کامل اپلیکیشن ProductPlus

## 📋 مراحل تست به ترتیب

### مرحله 1: تست اتصال دیتابیس ✅
**وضعیت**: تکمیل شده
- دیتابیس PostgreSQL متصل است
- جداول ایجاد شده‌اند
- Prisma Client تولید شده است

### مرحله 2: تست سیستم احراز هویت

#### 2.1 تست ثبت‌نام کاربر جدید
**URL**: `https://swpl.ir/register`
**داده‌های تست**:
```json
{
  "name": "احمد محمدی",
  "email": "ahmad@test.com",
  "password": "123456"
}
```

#### 2.2 تست ورود کاربر
**URL**: `https://swpl.ir/login`
**داده‌های تست**:
```json
{
  "email": "ahmad@test.com",
  "password": "123456"
}
```

### مرحله 3: تست مدیریت دسته‌بندی‌ها

#### 3.1 ایجاد دسته‌بندی جدید
**API**: `POST /api/categories`
**داده‌های تست**:
```json
{
  "name": "لپ‌تاپ",
  "description": "لپ‌تاپ‌های مختلف"
}
```

### مرحله 4: تست مدیریت محصولات

#### 4.1 افزودن محصول جدید
**URL**: `https://swpl.ir/add-product`
**داده‌های تست**:
```json
{
  "name": "لپ‌تاپ Dell Inspiron",
  "price": 25000000,
  "description": "لپ‌تاپ 15 اینچی با پردازنده Intel i5",
  "stock": 10,
  "categoryId": 1
}
```

## 🎯 داده‌های فیک برای تست

### کاربران نمونه
```json
[
  {
    "name": "مدیر سیستم",
    "email": "admin@productplus.com",
    "password": "admin123",
    "role": "ADMIN"
  },
  {
    "name": "کاربر عادی",
    "email": "user@productplus.com",
    "password": "user123",
    "role": "USER"
  }
]
```

### محصولات نمونه
```json
[
  {
    "name": "لپ‌تاپ Dell Inspiron 15",
    "price": 25000000,
    "description": "لپ‌تاپ 15 اینچی با پردازنده Intel i5",
    "stock": 15,
    "categoryId": 1
  },
  {
    "name": "گوشی Samsung Galaxy S23",
    "price": 35000000,
    "description": "گوشی هوشمند با دوربین 108 مگاپیکسل",
    "stock": 25,
    "categoryId": 2
  }
]
```

## ✅ چک‌لیست تست نهایی

- [ ] اتصال دیتابیس
- [ ] ثبت‌نام کاربر
- [ ] ورود کاربر
- [ ] ایجاد دسته‌بندی
- [ ] افزودن محصول
- [ ] مدیریت کاربران (ADMIN)
- [ ] مدیریت سفارشات
- [ ] تست امنیت
- [ ] تست ریسپانسیو
- [ ] تست عملکرد
