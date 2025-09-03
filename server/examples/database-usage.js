// Example database operations for FlexPass backend
import { db } from '../lib/database.js'

// Example 1: Creating a service provider
async function createServiceProviderExample() {
  const provider = await db.createServiceProvider({
    name: "Premium API Access",
    apiEndpoint: "/premium-api/data", 
    price: "0.05",
    walletAddress: "0xF932511A24D302d14317C861c6A9B4F408cb9057"
  })
  
  console.log('Created service provider:', provider)
  return provider
}

// Example 2: Recording a transaction
async function recordTransactionExample() {
  const transaction = await db.recordTransaction({
    txHash: "0x1234567890abcdef1234567890abcdef12345678",
    fromAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e",
    toAddress: "0xF932511A24D302d14317C861c6A9B4F408cb9057",
    amount: "0.05",
    currency: "USDC",
    status: "CONFIRMED"
  })
  
  console.log('Recorded transaction:', transaction)
  return transaction
}

// Example 3: Checking if a user has an active pass
async function checkActivePassExample() {
  const userWallet = "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e"
  const serviceId = "service-provider-id"
  
  const hasAccess = await db.checkActivePass(userWallet, serviceId)
  
  if (hasAccess) {
    console.log('User has active pass:', hasAccess)
    console.log('Pass type:', hasAccess.passType)
    console.log('Expires:', hasAccess.expiryDate)
    console.log('Remaining uses:', hasAccess.remainingUses)
  } else {
    console.log('User does not have active pass')
  }
  
  return hasAccess
}

// Example 4: Creating different types of active passes
async function createActivePassExamples() {
  // Time-based pass (24 hours)
  const timeBased = await db.createActivePass({
    userWallet: "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e",
    serviceId: "service-id",
    passType: "TIME_BASED",
    expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  })
  
  // Usage-based pass (10 uses)
  const usageBased = await db.createActivePass({
    userWallet: "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e", 
    serviceId: "service-id",
    passType: "USAGE_BASED",
    remainingUses: 10
  })
  
  // Unlimited pass
  const unlimited = await db.createActivePass({
    userWallet: "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e",
    serviceId: "service-id", 
    passType: "UNLIMITED"
  })
  
  console.log('Created passes:', { timeBased, usageBased, unlimited })
  return { timeBased, usageBased, unlimited }
}

// Example 5: Complete payment flow simulation
async function simulatePaymentFlow() {
  console.log('=== Payment Flow Simulation ===')
  
  // 1. Create service provider
  const service = await createServiceProviderExample()
  
  // 2. User makes payment
  const transaction = await recordTransactionExample()
  
  // 3. Create active pass after successful payment
  const activePass = await db.createActivePass({
    userWallet: transaction.fromAddress,
    serviceId: service.id,
    passType: "TIME_BASED",
    expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  })
  
  // 4. Check access
  const hasAccess = await db.checkActivePass(transaction.fromAddress, service.id)
  
  console.log('Payment flow completed:', {
    service: service.name,
    transaction: transaction.txHash,
    activePass: activePass.id,
    hasAccess: !!hasAccess
  })
  
  return { service, transaction, activePass, hasAccess }
}

// Export examples for testing
export {
  createServiceProviderExample,
  recordTransactionExample,
  checkActivePassExample,
  createActivePassExamples,
  simulatePaymentFlow
}
