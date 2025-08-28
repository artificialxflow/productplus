const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔌 تست اتصال به دیتابیس...');
    
    // تست اتصال
    await prisma.$connect();
    console.log('✅ اتصال به دیتابیس موفقیت‌آمیز بود');
    
    // تست شمارش محصولات
    const productCount = await prisma.product.count();
    console.log(`📦 تعداد محصولات در دیتابیس: ${productCount}`);
    
    // تست شمارش دسته‌بندی‌ها
    const categoryCount = await prisma.category.count();
    console.log(`📂 تعداد دسته‌بندی‌ها: ${categoryCount}`);
    
    // تست شمارش کاربران
    const userCount = await prisma.user.count();
    console.log(`👥 تعداد کاربران: ${userCount}`);
    
    if (productCount === 0) {
      console.log('⚠️  هیچ محصولی در دیتابیس وجود ندارد. نیاز به seeding هست.');
    }
    
  } catch (error) {
    console.error('❌ خطا در اتصال به دیتابیس:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
