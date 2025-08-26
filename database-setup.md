# راهنمای تنظیم دیتابیس ProductPlus

## مشکل فعلی
خطای `Database '%d8%b1%d8%a7' does not exist` نشان می‌دهد که نام دیتابیس به درستی encode نشده است.

## راه حل

### 1. ایجاد دیتابیس جدید با نام انگلیسی
در phpMyAdmin:
1. دیتابیس جدید با نام `productplus_db` ایجاد کنید
2. یا نام دیتابیس فعلی رو به `productplus` تغییر دهید

### 2. تنظیم فایل .env.local
```
DATABASE_URL="mysql://root@localhost:3307/productplus_db"
# یا
DATABASE_URL="mysql://root@localhost:3307/productplus"
```

### 3. اجرای دستورات
```bash
# Push schema به دیتابیس
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed داده‌ها
npm run seed
```

### 4. راه‌اندازی سرور
```bash
npm run dev
```

## اطلاعات ورود بعد از seeding:
- 👤 Admin: admin@productplus.com / admin123
- 👤 User: user@productplus.com / user123
