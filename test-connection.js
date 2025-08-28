const { PrismaClient } = require('@prisma/client');

// تست اتصال به دیتابیس
async function testDatabaseConnection() {
  console.log('🔌 تست اتصال به دیتابیس...');
  
  try {
    // ایجاد Prisma Client با URL مستقیم
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: "mysql://root:mcTY3QExlwuFyzet11cyoXde@annapurna.liara.cloud:32191/laughing_kilby"
        }
      }
    });

    // تست اتصال
    await prisma.$connect();
    console.log('✅ اتصال به دیتابیس موفقیت‌آمیز بود');
    
    // تست شمارش جداول
    const userCount = await prisma.user.count();
    console.log(`👥 تعداد کاربران: ${userCount}`);
    
    const productCount = await prisma.product.count();
    console.log(`📦 تعداد محصولات: ${productCount}`);
    
    const categoryCount = await prisma.category.count();
    console.log(`📂 تعداد دسته‌بندی‌ها: ${categoryCount}`);
    
    await prisma.$disconnect();
    console.log('✅ اتصال بسته شد');
    
  } catch (error) {
    console.error('❌ خطا در اتصال به دیتابیس:', error.message);
    
    if (error.code === 'P1001') {
      console.log('💡 راه حل: بررسی کنید که دیتابیس MySQL در دسترس باشد');
    } else if (error.code === 'P1002') {
      console.log('💡 راه حل: بررسی کنید که DATABASE_URL درست باشد');
    } else if (error.code === 'P1008') {
      console.log('💡 راه حل: بررسی کنید که دیتابیس وجود داشته باشد');
    }
  }
}

// اجرای تست
testDatabaseConnection();
