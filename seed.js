const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 شروع seeding دیتابیس...');

  // پاک کردن تمام داده‌ها از جداول (به ترتیب صحیح)
  console.log('🧹 پاک کردن داده‌های موجود...');
  
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.userLevel.deleteMany({});

  console.log('✅ داده‌های موجود پاک شدند');

  // ایجاد سطوح تخفیف
  const userLevels = await Promise.all([
    prisma.userLevel.create({
      data: {
        name: 'کاربر عادی',
        discountPercentage: 0,
        description: 'کاربران جدید بدون تخفیف'
      }
    }),
    prisma.userLevel.create({
      data: {
        name: 'کاربر نقره‌ای',
        discountPercentage: 5,
        description: 'تخفیف 5 درصدی'
      }
    }),
    prisma.userLevel.create({
      data: {
        name: 'کاربر طلایی',
        discountPercentage: 10,
        description: 'تخفیف 10 درصدی'
      }
    }),
    prisma.userLevel.create({
      data: {
        name: 'کاربر الماس',
        discountPercentage: 15,
        description: 'تخفیف 15 درصدی'
      }
    })
  ]);

  console.log('✅ سطوح تخفیف ایجاد شدند');

  // ایجاد کاربر Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@productplus.com',
      name: 'مدیر سیستم',
      password: hashedPassword,
      role: 'ADMIN',
      levelId: userLevels[3].id, // کاربر الماس
      discountPercentage: 15
    }
  });

  console.log('✅ کاربر Admin ایجاد شد');

  // ایجاد کاربر عادی
  const normalUserPassword = await bcrypt.hash('user123', 10);
  const normalUser = await prisma.user.create({
    data: {
      email: 'user@productplus.com',
      name: 'کاربر عادی',
      password: normalUserPassword,
      role: 'USER',
      levelId: userLevels[1].id, // کاربر نقره‌ای
      discountPercentage: 5
    }
  });

  console.log('✅ کاربر عادی ایجاد شد');

  // ایجاد دسته‌بندی‌ها
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'لوازم الکترونیکی',
        description: 'گوشی، لپ‌تاپ، تبلت و سایر لوازم الکترونیکی'
      }
    }),
    prisma.category.create({
      data: {
        name: 'پوشاک',
        description: 'لباس، کفش و سایر پوشاک'
      }
    }),
    prisma.category.create({
      data: {
        name: 'کتاب و لوازم التحریر',
        description: 'کتاب‌های مختلف و لوازم التحریر'
      }
    }),
    prisma.category.create({
      data: {
        name: 'خودرو و موتورسیکلت',
        description: 'لوازم جانبی خودرو و موتورسیکلت'
      }
    })
  ]);

  console.log('✅ دسته‌بندی‌ها ایجاد شدند');

  // ایجاد محصولات نمونه
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'گوشی هوشمند Samsung Galaxy S23',
        price: 25000000,
        serialNumber: 'SAMS-001',
        description: 'گوشی هوشمند سامسونگ با دوربین 108 مگاپیکسل',
        stock: 50,
        categoryId: categories[0].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'لپ‌تاپ Dell Inspiron 15',
        price: 45000000,
        serialNumber: 'DELL-001',
        description: 'لپ‌تاپ دل با پردازنده Intel Core i7',
        stock: 25,
        categoryId: categories[0].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'کفش ورزشی Nike Air Max',
        price: 2800000,
        serialNumber: 'NIKE-001',
        description: 'کفش ورزشی نایک با طراحی مدرن',
        stock: 100,
        categoryId: categories[1].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'کت چرم مردانه',
        price: 8500000,
        serialNumber: 'JACKET-001',
        description: 'کت چرم با کیفیت بالا',
        stock: 30,
        categoryId: categories[1].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'کتاب برنامه‌نویسی جاوااسکریپت',
        price: 850000,
        serialNumber: 'BOOK-001',
        description: 'کتاب کامل آموزش جاوااسکریپت',
        stock: 75,
        categoryId: categories[2].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'لپ‌تاپ MacBook Pro 16',
        price: 85000000,
        serialNumber: 'MAC-001',
        description: 'لپ‌تاپ اپل با پردازنده M2 Pro',
        stock: 15,
        categoryId: categories[0].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'تبلت Apple iPad Pro 12.9',
        price: 35000000,
        serialNumber: 'IPAD-001',
        description: 'تبلت حرفه‌ای اپل با صفحه نمایش 12.9 اینچ',
        stock: 20,
        categoryId: categories[0].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'ساعت هوشمند Apple Watch Series 8',
        price: 12000000,
        serialNumber: 'WATCH-001',
        description: 'ساعت هوشمند اپل با قابلیت‌های بهداشتی',
        stock: 40,
        categoryId: categories[0].id
      }
    })
  ]);

  console.log('✅ محصولات نمونه ایجاد شدند');

  // ایجاد تصاویر برای محصولات
  const productImages = await Promise.all([
    prisma.productImage.create({
      data: {
        productId: products[0].id,
        url: '/uploads/products/product_3_1755596741267.jpg',
        alt: 'گوشی Samsung Galaxy S23',
        isPrimary: true,
        order: 1
      }
    }),
    prisma.productImage.create({
      data: {
        productId: products[1].id,
        url: '/uploads/products/default-laptop.jpg',
        alt: 'لپ‌تاپ Dell Inspiron',
        isPrimary: true,
        order: 1
      }
    }),
    prisma.productImage.create({
      data: {
        productId: products[2].id,
        url: '/uploads/products/default-shoe.jpg',
        alt: 'کفش Nike Air Max',
        isPrimary: true,
        order: 1
      }
    })
  ]);

  console.log('✅ تصاویر محصولات ایجاد شدند');

  // ایجاد سفارش نمونه
  const sampleOrder = await prisma.order.create({
    data: {
      userId: normalUser.id,
      status: 'PENDING',
      totalAmount: 27850000 // 25000000 + 2850000 - 5% discount
    }
  });

  // ایجاد آیتم‌های سفارش
  await Promise.all([
    prisma.orderItem.create({
      data: {
        orderId: sampleOrder.id,
        productId: products[0].id,
        quantity: 1,
        price: 25000000
      }
    }),
    prisma.orderItem.create({
      data: {
        orderId: sampleOrder.id,
        productId: products[2].id,
        quantity: 1,
        price: 2850000
      }
    })
  ]);

  console.log('✅ سفارش نمونه ایجاد شد');

  console.log('\n🎉 Seeding با موفقیت تکمیل شد!');
  console.log('\n📋 اطلاعات ورود:');
  console.log('👤 Admin: admin@productplus.com / admin123');
  console.log('👤 User: user@productplus.com / user123');
  console.log('\n📊 آمار:');
  console.log(`- ${userLevels.length} سطح تخفیف`);
  console.log(`- ${categories.length} دسته‌بندی`);
  console.log(`- ${products.length} محصول`);
  console.log(`- ${productImages.length} تصویر محصول`);
  console.log('- 1 سفارش نمونه');
}

main()
  .catch((e) => {
    console.error('❌ خطا در seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
