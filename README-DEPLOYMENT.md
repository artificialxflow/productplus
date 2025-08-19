# 🚀 راهنمای دیپلوی ProductPlus در cPanel

## 📋 پیش‌نیازها

### در cPanel:
- ✅ Node.js (نسخه 18 یا بالاتر)
- ✅ PM2 (برای مدیریت process)
- ✅ PostgreSQL (برای دیتابیس)
- ✅ SSH Access

### در سرور:
- ✅ Git
- ✅ npm/yarn

## 🔧 مراحل دیپلوی

### ۱. اتصال به سرور
```bash
ssh username@your-domain.com
cd public_html
```

### ۲. کلون کردن پروژه
```bash
git clone https://github.com/username/productplus.git
cd productplus
```

### ۳. نصب dependencies
```bash
npm install
```

### ۴. تنظیم متغیرهای محیطی
```bash
# ایجاد فایل .env
cp .env.example .env

# ویرایش فایل .env
nano .env
```

**محتویات فایل `.env`:**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Environment
NODE_ENV=production
PORT=3000
```

### ۵. تنظیم دیتابیس
```bash
# ایجاد جداول
npx prisma db push

# تولید Prisma Client
npx prisma generate
```

### ۶. Build کردن پروژه
```bash
npm run build
```

### ۷. راه‌اندازی با PM2
```bash
# نصب PM2 (اگر نصب نیست)
npm install -g pm2

# راه‌اندازی اپلیکیشن
pm2 start ecosystem.config.js --env production

# ذخیره تنظیمات
pm2 save

# تنظیم PM2 برای راه‌اندازی خودکار
pm2 startup
```

### ۸. تنظیم cPanel

#### در cPanel:
1. **Node.js Apps** را باز کنید
2. **Create Application** کلیک کنید
3. تنظیمات زیر را وارد کنید:
   - **Node.js version**: 18.x یا بالاتر
   - **Application mode**: Production
   - **Application root**: `/home/username/public_html/productplus`
   - **Application URL**: `your-domain.com`
   - **Application startup file**: `server.js`
   - **Passenger port**: `3000`

#### تنظیم .htaccess:
فایل `.htaccess` در پوشه `public` قرار دارد و باید در root دامنه کپی شود.

## 🔍 بررسی عملکرد

### تست اپلیکیشن:
```bash
# بررسی وضعیت PM2
pm2 status

# مشاهده لاگ‌ها
pm2 logs productplus

# تست health endpoint
curl http://your-domain.com/health
```

### تست دیتابیس:
```bash
# اتصال به دیتابیس
npx prisma studio
```

## 🛠️ مدیریت اپلیکیشن

### دستورات مفید:
```bash
# راه‌اندازی مجدد
pm2 restart productplus

# توقف
pm2 stop productplus

# شروع
pm2 start productplus

# حذف
pm2 delete productplus

# مشاهده اطلاعات
pm2 info productplus
```

### آپدیت اپلیکیشن:
```bash
# دریافت تغییرات جدید
git pull origin main

# نصب dependencies جدید
npm install

# build مجدد
npm run build

# راه‌اندازی مجدد
pm2 restart productplus
```

## 🚨 عیب‌یابی

### مشکلات رایج:

#### ۱. خطای Port در use:
```bash
# بررسی پورت‌های استفاده شده
netstat -tulpn | grep :3000

# کشتن process
kill -9 PID
```

#### ۲. خطای دیتابیس:
```bash
# بررسی اتصال دیتابیس
npx prisma db push

# بررسی Prisma Client
npx prisma generate
```

#### ۳. خطای Memory:
```bash
# افزایش memory limit در ecosystem.config.js
max_memory_restart: '2G'
```

## 📊 مانیتورینگ

### مشاهده آمار:
```bash
# آمار کلی
pm2 monit

# آمار CPU/Memory
pm2 show productplus
```

### لاگ‌ها:
```bash
# لاگ‌های real-time
pm2 logs productplus --lines 100

# لاگ‌های error
pm2 logs productplus --err --lines 50
```

## 🔒 امنیت

### تنظیمات امنیتی:
1. **Firewall**: فقط پورت 80 و 443 باز باشد
2. **HTTPS**: SSL certificate نصب شود
3. **Environment Variables**: فایل `.env` در `.gitignore` باشد
4. **Database**: دسترسی دیتابیس محدود شود

## 📞 پشتیبانی

در صورت بروز مشکل:
1. لاگ‌های PM2 را بررسی کنید
2. وضعیت دیتابیس را چک کنید
3. متغیرهای محیطی را بررسی کنید
4. با تیم پشتیبانی تماس بگیرید

---

**🎯 نکته مهم:** قبل از دیپلوی در production، حتماً در محیط test تست کنید!
