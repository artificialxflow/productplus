# راهنمای نصب و راه‌اندازی ProductPlus

## پیش‌نیازها
- Node.js 18+ 
- npm یا yarn
- MySQL Database

## مراحل نصب

### 1. نصب Dependencies
```bash
npm install
```

### 2. تنظیم متغیرهای محیطی
فایل `env.local` را در ریشه پروژه ایجاد کنید:
```bash
# Database Configuration
DATABASE_URL="mysql://root:mcTY3QExlwuFyzet11cyoXde@annapurna.liara.cloud:32191/laughing_kilby"

# JWT Configuration
JWT_SECRET="ey-name-to-behtarin-saraghaz-ey-name-to-behtarin-saraghaz"

# NextAuth Configuration
NEXTAUTH_SECRET="ey-name-to-behtarin-saraghaz-ey-name-to-behtarin-saraghaz"
NEXTAUTH_URL="https://swpl.ir"

# Environment
NODE_ENV="production"

# Domain Configuration
NEXT_PUBLIC_DOMAIN="https://swpl.ir"
NEXT_PUBLIC_API_BASE_URL="https://swpl.ir/api"
```

### 3. تولید Prisma Client
```bash
npx prisma generate
```

### 4. Push Schema به دیتابیس
```bash
npx prisma db push
```

### 5. Seed داده‌ها (اختیاری)
```bash
npm run seed
```

### 6. اجرای پروژه
```bash
# Development
npm run dev

# Production Build
npm run build

# Production Start
npm start
```

## اطلاعات ورود پیش‌فرض
- 👤 Admin: admin@productplus.com / admin123
- 👤 User: user@productplus.com / user123

## ساختار پروژه
- `app/` - Next.js App Router
- `components/` - React Components
- `lib/` - Utility Functions (Prisma Client)
- `prisma/` - Database Schema
- `contexts/` - React Contexts
- `types/` - TypeScript Types

## تکنولوژی‌های استفاده شده
- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MySQL + Prisma ORM
- **Authentication**: JWT + bcrypt
- **UI**: Bootstrap 5, SweetAlert2
- **File Upload**: React Dropzone
- **Deployment**: Liara, Vercel

## حل مشکلات رایج

### خطای Prisma Connection
- مطمئن شوید که `DATABASE_URL` درست تنظیم شده است
- دیتابیس MySQL در دسترس است
- Prisma Client تولید شده است

### خطای Import
- مسیرهای import در API routes درست باشند
- فایل `lib/prisma.ts` وجود دارد

### خطای Build
- همه dependencies نصب شده‌اند
- TypeScript errors حل شده‌اند
- Prisma schema معتبر است
