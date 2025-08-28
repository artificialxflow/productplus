import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "mysql://root:mcTY3QExlwuFyzet11cyoXde@annapurna.liara.cloud:32191/laughing_kilby"
    }
  },
  // بهبود error handling
  errorFormat: 'pretty'
})

// اصلاح شده: همیشه globalForPrisma را تنظیم کن
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// اضافه کردن error handling - فقط در development
if (process.env.NODE_ENV === 'development') {
  // Log Prisma queries
  console.log('Prisma Client initialized in development mode')
}
