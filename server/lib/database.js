import { PrismaClient } from '@prisma/client'

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

// Database service layer with example queries
export class DatabaseService {
  constructor() {
    this.prisma = prisma
  }

  // Service Provider Operations
  async createServiceProvider(data) {
    /**
     * Example: Creating a service provider
     * const provider = await db.createServiceProvider({
     *   name: "Premium API Access",
     *   apiEndpoint: "/premium-api/data",
     *   price: "0.05",
     *   walletAddress: "0xF932511A24D302d14317C861c6A9B4F408cb9057"
     * })
     */
    return await this.prisma.serviceProvider.create({
      data: {
        name: data.name,
        apiEndpoint: data.apiEndpoint,
        price: data.price,
        walletAddress: data.walletAddress,
      }
    })
  }

  async getServiceProviders() {
    return await this.prisma.serviceProvider.findMany({
      orderBy: { createdAt: 'desc' }
    })
  }

  async getServiceProviderByEndpoint(endpoint) {
    return await this.prisma.serviceProvider.findFirst({
      where: { apiEndpoint: endpoint }
    })
  }

  // Transaction Operations
  async recordTransaction(data) {
    /**
     * Example: Recording a transaction
     * const transaction = await db.recordTransaction({
     *   txHash: "0x1234...",
     *   fromAddress: "0xuser...",
     *   toAddress: "0xservice...",
     *   amount: "0.05",
     *   currency: "USDC",
     *   status: "CONFIRMED"
     * })
     */
    return await this.prisma.transaction.create({
      data: {
        txHash: data.txHash,
        fromAddress: data.fromAddress,
        toAddress: data.toAddress,
        amount: data.amount,
        currency: data.currency,
        status: data.status || 'PENDING',
      }
    })
  }

  async updateTransactionStatus(txHash, status) {
    return await this.prisma.transaction.update({
      where: { txHash },
      data: { status }
    })
  }

  async getTransactionByHash(txHash) {
    return await this.prisma.transaction.findUnique({
      where: { txHash }
    })
  }

  // Active Pass Operations
  async createActivePass(data) {
    /**
     * Example: Creating an active pass
     * const pass = await db.createActivePass({
     *   userWallet: "0xuser...",
     *   serviceId: "service-id",
     *   passType: "TIME_BASED",
     *   expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
     * })
     */
    return await this.prisma.activePass.create({
      data: {
        userWallet: data.userWallet,
        serviceId: data.serviceId,
        passType: data.passType,
        expiryDate: data.expiryDate,
        remainingUses: data.remainingUses,
      }
    })
  }

  async checkActivePass(userWallet, serviceId) {
    /**
     * Example: Checking if a user has an active pass
     * const hasAccess = await db.checkActivePass(
     *   "0xuser...", 
     *   "service-id"
     * )
     */
    const activePass = await this.prisma.activePass.findFirst({
      where: {
        userWallet,
        serviceId,
        isActive: true,
        OR: [
          // Time-based pass that hasn't expired
          {
            passType: 'TIME_BASED',
            expiryDate: { gt: new Date() }
          },
          // Usage-based pass with remaining uses
          {
            passType: 'USAGE_BASED',
            remainingUses: { gt: 0 }
          },
          // Unlimited pass
          {
            passType: 'UNLIMITED'
          }
        ]
      },
      include: {
        serviceProvider: true
      }
    })

    return activePass
  }

  async consumePassUsage(passId) {
    // Decrement remaining uses for usage-based passes
    const pass = await this.prisma.activePass.findUnique({
      where: { id: passId }
    })

    if (pass && pass.passType === 'USAGE_BASED' && pass.remainingUses > 0) {
      const updatedPass = await this.prisma.activePass.update({
        where: { id: passId },
        data: { 
          remainingUses: pass.remainingUses - 1,
          isActive: pass.remainingUses - 1 > 0 // Deactivate if no uses left
        }
      })
      return updatedPass
    }

    return pass
  }

  async deactivateExpiredPasses() {
    // Cleanup job to deactivate expired passes
    return await this.prisma.activePass.updateMany({
      where: {
        isActive: true,
        passType: 'TIME_BASED',
        expiryDate: { lt: new Date() }
      },
      data: { isActive: false }
    })
  }

  async getUserPasses(userWallet) {
    return await this.prisma.activePass.findMany({
      where: { userWallet },
      include: {
        serviceProvider: true
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  async getTransactionHistory(userWallet, limit = 50) {
    return await this.prisma.transaction.findMany({
      where: { fromAddress: userWallet },
      orderBy: { timestamp: 'desc' },
      take: limit
    })
  }

  // Cleanup and maintenance
  async disconnect() {
    await this.prisma.$disconnect()
  }
}

// Export singleton instance
export const db = new DatabaseService()
export { prisma }
