import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default service provider
  const defaultService = await prisma.serviceProvider.upsert({
    where: { name: 'FlexPass Premium API' },
    update: {},
    create: {
      name: 'FlexPass Premium API',
      apiEndpoint: '/premium-api/data',
      price: '0.05',
      walletAddress: '0xF932511A24D302d14317C861c6A9B4F408cb9057',
    },
  })

  console.log('Created service provider:', defaultService)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
