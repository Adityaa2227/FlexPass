import express from 'express';
import { paymentMiddleware } from 'x402-express';
import cors from 'cors';
import dotenv from 'dotenv';
// import { db } from './lib/database.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// x402 payment middleware configuration
app.use(paymentMiddleware(
  "0xF932511A24D302d14317C861c6A9B4F408cb9057", // Replace with your receiving address
  {
    "/premium-api/data": {
      price: "$0.05",
      network: "base-sepolia",
      config: {
        description: "Access to premium FlexPass data",
        facilitatorUrl: "https://facilitator.cdp.coinbase.com"
      }
    }
  }
));

// Free endpoint - no payment required
app.get('/free-api/data', (req, res) => {
  res.json({ 
    message: "This is free data 🎉",
    timestamp: new Date().toISOString()
  });
});

// Premium endpoint - check ActivePass first, then require payment
app.get('/premium-api/data', async (req, res) => {
  try {
    // Extract user wallet from request headers or query params
    const userWallet = req.headers['x-user-wallet'] || req.query.wallet;
    
    if (userWallet) {
      // Check if user has an active pass
      const service = await db.getServiceProviderByEndpoint('/premium-api/data');
      if (service) {
        const activePass = await db.checkActivePass(userWallet, service.id);
        
        if (activePass) {
          // User has active pass - consume usage if needed
          if (activePass.passType === 'USAGE_BASED') {
            await db.consumePassUsage(activePass.id);
          }
          
          // Return premium data without payment
          return res.json({ 
            message: "Unlocked premium data ✅ (Active Pass)",
            timestamp: new Date().toISOString(),
            passType: activePass.passType,
            premiumContent: {
              analytics: "Advanced analytics data",
              insights: "Premium market insights", 
              features: "Exclusive features unlocked"
            }
          });
        }
      }
    }
    
    // No active pass - proceed with x402 payment flow
    // This will be handled by the x402 middleware
    res.json({ 
      message: "Unlocked premium data ✅",
      timestamp: new Date().toISOString(),
      premiumContent: {
        analytics: "Advanced analytics data",
        insights: "Premium market insights",
        features: "Exclusive features unlocked"
      }
    });
  } catch (error) {
    console.error('Premium endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    server: 'FlexPass Backend',
    timestamp: new Date().toISOString()
  });
});

// Service Provider Management Endpoints
app.post('/api/service-providers', async (req, res) => {
  try {
    const { name, apiEndpoint, price, walletAddress } = req.body;
    
    const serviceProvider = await db.createServiceProvider({
      name,
      apiEndpoint,
      price,
      walletAddress
    });
    
    res.status(201).json(serviceProvider);
  } catch (error) {
    console.error('Failed to create service provider:', error);
    res.status(400).json({ error: 'Failed to create service provider' });
  }
});

app.get('/api/service-providers', async (req, res) => {
  try {
    const providers = await db.getServiceProviders();
    res.json(providers);
  } catch (error) {
    console.error('Failed to get service providers:', error);
    res.status(500).json({ error: 'Failed to get service providers' });
  }
});

// Transaction Management Endpoints
app.post('/api/transactions', async (req, res) => {
  try {
    const { txHash, fromAddress, toAddress, amount, currency, status } = req.body;
    
    const transaction = await db.recordTransaction({
      txHash,
      fromAddress,
      toAddress,
      amount,
      currency,
      status
    });
    
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Failed to record transaction:', error);
    res.status(400).json({ error: 'Failed to record transaction' });
  }
});

app.get('/api/transactions/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;
    const transactions = await db.getTransactionHistory(wallet);
    res.json(transactions);
  } catch (error) {
    console.error('Failed to get transactions:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// Active Pass Management Endpoints
app.post('/api/active-passes', async (req, res) => {
  try {
    const { userWallet, serviceId, passType, expiryDate, remainingUses } = req.body;
    
    const activePass = await db.createActivePass({
      userWallet,
      serviceId,
      passType,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      remainingUses
    });
    
    res.status(201).json(activePass);
  } catch (error) {
    console.error('Failed to create active pass:', error);
    res.status(400).json({ error: 'Failed to create active pass' });
  }
});

app.get('/api/active-passes/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;
    const passes = await db.getUserPasses(wallet);
    res.json(passes);
  } catch (error) {
    console.error('Failed to get user passes:', error);
    res.status(500).json({ error: 'Failed to get user passes' });
  }
});

// Webhook endpoint for processing successful payments
app.post('/api/webhook/payment-success', async (req, res) => {
  try {
    const { txHash, userWallet, serviceEndpoint } = req.body;
    
    // Find the service provider
    const service = await db.getServiceProviderByEndpoint(serviceEndpoint);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    // Create active pass (24-hour time-based pass)
    const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const activePass = await db.createActivePass({
      userWallet,
      serviceId: service.id,
      passType: 'TIME_BASED',
      expiryDate
    });
    
    // Update transaction status
    await db.updateTransactionStatus(txHash, 'CONFIRMED');
    
    res.json({ 
      success: true, 
      activePass,
      message: 'Pass activated successfully'
    });
  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Cleanup expired passes (run periodically)
app.post('/api/cleanup/expired-passes', async (req, res) => {
  try {
    const result = await db.deactivateExpiredPasses();
    res.json({ 
      success: true, 
      deactivatedCount: result.count,
      message: 'Expired passes cleaned up'
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Failed to cleanup expired passes' });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 FlexPass Backend running on http://localhost:${PORT}`);
  console.log(`📊 Free endpoint: http://localhost:${PORT}/free-api/data`);
  console.log(`💰 Premium endpoint: http://localhost:${PORT}/premium-api/data`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️  Database: PostgreSQL with Prisma ORM`);
  
  // Run cleanup on startup
  try {
    await db.deactivateExpiredPasses();
    console.log(`🧹 Cleaned up expired passes`);
  } catch (error) {
    console.error('Failed to cleanup expired passes on startup:', error);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await db.disconnect();
  process.exit(0);
});

export default app;
