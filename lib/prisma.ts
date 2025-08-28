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
  errorFormat: 'pretty',
  // تنظیمات connection pool
  __internal: {
    engine: {
      enableEngineDebugMode: process.env.NODE_ENV === 'development'
    }
  }
})

// اصلاح شده: همیشه globalForPrisma را تنظیم کن
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// اضافه کردن error handling
prisma.$on('error', (e) => {
  console.error('Prisma Error:', e)
})

prisma.$on('query', (e) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Prisma Query:', e.query)
    console.log('Prisma Params:', e.params)
    console.log('Prisma Duration:', e.duration + 'ms')
  }
})
