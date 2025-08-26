import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Add your seed data here
  console.log('Seeding database...')
  
  // Example: Create a default user level
  const defaultLevel = await prisma.userLevel.upsert({
    where: { name: 'عادی' },
    update: {},
    create: {
      name: 'عادی',
      discountPercentage: 0,
      description: 'کاربر عادی بدون تخفیف'
    }
  })
  
  console.log('Default user level created:', defaultLevel)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
