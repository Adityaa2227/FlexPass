# FlexPass - Universal Web3 Micro-Subscription Pass Platform

A revolutionary decentralized application (dApp) that enables users to purchase flexible micro-subscription passes for premium services using USDC payments on Base Sepolia. Built with React, TypeScript, Tailwind CSS, Coinbase Smart Wallet SDK, x402 payment middleware, and Solidity smart contracts.

## 🚀 Core Features

### 🔗 **Coinbase Smart Wallet Integration**
- **CDP SDK Integration**: Seamless wallet creation and connection using Coinbase Developer Platform
- **Smart Wallet**: Non-custodial wallet with social recovery and gasless transactions
- **Base Sepolia**: Built on Coinbase's Layer 2 for fast, cheap transactions
- **USDC Native**: Direct USDC payments with 6-decimal precision ($1.00 = 1,000,000 units)

### 💰 **x402 Payment Middleware**
- **HTTP 402 Protocol**: Industry-standard payment required responses
- **Microtransaction Support**: Pay-per-use model for API endpoints
- **Pass-based Authentication**: Blockchain-verified access tokens
- **Automatic Payment Processing**: Seamless payment flow with webhook integration
- **Real-time Verification**: On-chain pass validation before service access

### 🎯 **Universal Pass System**
- **Multi-Service Access**: Single pass for multiple premium services
- **Flexible Duration**: Purchase passes for any duration (hours/days/weeks)
- **Real-time Countdown**: Live expiration timers with progress bars
- **Pass Management**: Extend, revoke, and transfer passes
- **Cross-Platform**: Access services from any device with valid pass

### 🏢 **Admin Console & Provider Management**
- **Secure Admin Panel**: Protected login system (`admin` / `admin@123`)
- **Provider CRUD**: Add, edit, delete service providers with real-time updates
- **Revenue Tracking**: Monitor total revenue and active passes
- **Fund Management**: Withdraw collected USDC revenue
- **Analytics Dashboard**: Provider performance and usage statistics

## 🎯 Premium Service Integrations

### 🤖 **ChatGPT Premium Clone** ($1.00/hour)
- **Advanced AI Chat**: GPT-4 level conversations with context awareness
- **Code Generation**: Full-stack development assistance and debugging
- **Data Analysis**: CSV processing, chart generation, statistical analysis
- **Creative Writing**: Stories, poems, scripts with advanced prompts
- **Research Mode**: Web search integration and citation support
- **Pass-Gated Access**: x402 verification before each API call

### 🎵 **Spotify Premium Clone** ($0.50/hour)
- **Ad-Free Music**: Unlimited streaming without interruptions
- **Offline Downloads**: Save tracks for offline listening
- **Unlimited Skips**: Skip any song without restrictions
- **High Quality Audio**: 320kbps streaming for premium sound
- **Premium Playlists**: Access to curated premium content
- **Pass-Based Authentication**: Blockchain-verified premium access

### 📺 **Netflix Premium** ($2.00/hour)
- **4K Ultra HD**: Premium video quality streaming
- **Multiple Screens**: Watch on up to 4 devices simultaneously
- **Exclusive Content**: Access to Netflix Originals and premium shows
- **Download & Go**: Offline viewing on mobile devices

### 📚 **Kindle Unlimited** ($0.75/hour)
- **Unlimited Reading**: Access to 2M+ books and audiobooks
- **Premium Titles**: Latest releases and bestsellers
- **Cross-Device Sync**: Read anywhere, sync everywhere
- **Whispersync**: Switch between reading and listening seamlessly

## 🛠️ Technology Stack

### **Frontend Architecture**
- **React 18**: Modern functional components with hooks
- **TypeScript**: Type-safe development with strict mode
- **Vite**: Lightning-fast build tool and dev server
- **Tailwind CSS**: Utility-first styling with custom design system
- **Framer Motion**: Smooth animations and micro-interactions
- **React Router DOM**: Client-side routing with protected routes

### **Web3 & Blockchain**
- **Coinbase CDP SDK**: Smart wallet creation and management
- **Base Sepolia**: Coinbase's L2 testnet for development
- **ethers.js v6**: Ethereum library for contract interactions
- **Smart Contracts**: Solidity with OpenZeppelin ERC721 standard
- **USDC Integration**: 6-decimal precision stable payments

### **Payment Infrastructure**
- **x402 Express Middleware**: HTTP 402 payment processing
- **Webhook Integration**: Real-time payment confirmation
- **Pass Verification**: On-chain validation before service access
- **Microtransaction Support**: Sub-dollar payments with precision

### **Backend & Database**
- **Node.js + Express**: RESTful API server
- **PostgreSQL**: Relational database for provider/transaction data
- **Prisma ORM**: Type-safe database operations
- **LocalStorage Fallback**: Offline demo mode support

### **UI/UX Components**
- **Lucide React**: Modern icon library
- **React Hot Toast**: Elegant notification system
- **Custom Components**: Reusable design system
- **Accessibility**: WCAG 2.1 AA compliance

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Coinbase Smart Wallet or compatible Web3 wallet
- Base Sepolia testnet ETH (for gas fees)
- Base Sepolia USDC tokens (for pass purchases)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd web3-micro-subscription-pass
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Configuration

#### **1. Environment Setup**
Create `.env` file in project root:
```bash
# Coinbase Developer Platform
VITE_CDP_PROJECT_ID=your_coinbase_project_id
VITE_CDP_API_KEY=your_cdp_api_key

# Smart Contract Addresses (Base Sepolia)
VITE_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
VITE_USDC_CONTRACT_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e

# x402 Payment Configuration
VITE_X402_WEBHOOK_URL=https://your-domain.com/webhook/payment
VITE_X402_PAYMENT_ENDPOINT=https://your-api.com/x402/verify

# Admin Configuration
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=admin@123
```

#### **2. Database Setup (PostgreSQL)**
```bash
# Install PostgreSQL and create database
psql -U postgres
CREATE DATABASE flexpass_db;

# Configure database connection
DATABASE_URL="postgresql://username:password@localhost:5432/flexpass_db"

# Run Prisma migrations
npx prisma migrate dev
npx prisma generate
```

#### **3. Smart Contract Deployment**
```bash
# Deploy FlexPass contract to Base Sepolia
npx hardhat run scripts/deploy.js --network baseSepolia

# Verify contract on Basescan
npx hardhat verify CONTRACT_ADDRESS --network baseSepolia

# Update contract address in src/config/blockchain.ts
```

#### **4. Coinbase Wallet Setup**
- **Create CDP Project**: Get project ID from Coinbase Developer Platform
- **Base Sepolia Network**: Ensure wallet connects to testnet
- **Get Test USDC**: Use Circle faucet for Base Sepolia USDC
- **Fund Gas**: Get Base Sepolia ETH from official faucet

#### **5. x402 Middleware Configuration**
```javascript
// server/middleware/x402.js
const x402 = require('x402-express')

app.use('/api/premium', x402({
  contractAddress: process.env.VITE_CONTRACT_ADDRESS,
  usdcAddress: process.env.VITE_USDC_CONTRACT_ADDRESS,
  webhookUrl: process.env.VITE_X402_WEBHOOK_URL,
  chainId: 84532, // Base Sepolia
  verificationMode: 'onchain'
}))
```

## 📜 Smart Contract

The `FlexPass` contract is an ERC-721 NFT that represents flexible subscription passes:

- **Provider-based**: Each pass is tied to a specific service provider
- **USDC Payments**: Stable pricing with 6-decimal precision
- **Flexible Duration**: Purchase passes for any duration (rounded up to hours)
- **No Duplicate Passes**: Prevents multiple active passes per provider per user
- **Admin Controls**: Owner can manage providers and withdraw revenue

### Key Contract Functions

- `buyPass(providerId, durationSeconds)`: Purchase a new pass with USDC
- `extendPass(tokenId, additionalSeconds)`: Extend existing pass duration
- `revokePass(tokenId)`: Revoke a pass and mark as inactive
- `isPassValid(tokenId)`: Check if pass is active and not expired
- `getUserPasses(user)`: Get all passes owned by a user
- `getActivePassByProvider(user, providerId)`: Get user's active pass for provider
- `addProvider(name, logoUrl, hourlyRate)`: Admin function to add providers
- `withdrawUSDC()`: Admin function to withdraw collected revenue

## 🔐 x402 Payment Middleware Integration

FlexPass implements the x402 protocol for seamless blockchain-verified API access:

### **Core x402 Features**
1. **HTTP 402 Responses**: Standard "Payment Required" status codes
2. **Pass Verification**: On-chain validation before each API request
3. **Automatic Payment Flow**: Redirect to payment when pass expires
4. **Webhook Processing**: Real-time payment confirmation handling
5. **Provider Isolation**: Separate access control per service provider
6. **Rate Limiting**: Built-in protection against abuse and spam

### **Payment Flow Architecture**
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant x402 Middleware
    participant Blockchain
    participant Service API
    
    User->>Frontend: Access Premium Service
    Frontend->>x402 Middleware: Request with Pass Token
    x402 Middleware->>Blockchain: Verify Pass Validity
    
    alt Pass Valid
        Blockchain-->>x402 Middleware: Pass Confirmed
        x402 Middleware->>Service API: Forward Request
        Service API-->>Frontend: Premium Content
    else Pass Invalid/Expired
        Blockchain-->>x402 Middleware: Pass Expired
        x402 Middleware-->>Frontend: HTTP 402 Payment Required
        Frontend->>User: Redirect to Purchase Flow
    end
```

### **Implementation Example**

```typescript
// x402 Payment Header Structure
const paymentHeaders = {
  'X-402-Payment': JSON.stringify({
    passId: pass.tokenId,
    provider: pass.provider.name,
    endpoint: '/api/premium/chatgpt',
    timestamp: Date.now(),
    chainId: 84532, // Base Sepolia
    contractAddress: process.env.VITE_CONTRACT_ADDRESS
  }),
  'Authorization': `Bearer ${pass.tokenId}`,
  'X-Pass-Provider': pass.provider.name,
  'X-Wallet-Address': walletAddress
}

// Service Access with x402 Verification
const accessPremiumService = async (serviceEndpoint: string) => {
  try {
    const response = await fetch(serviceEndpoint, {
      method: 'POST',
      headers: paymentHeaders,
      body: JSON.stringify({ query: userInput })
    })
    
    if (response.status === 402) {
      // Payment required - redirect to purchase flow
      redirectToPurchase(response.headers.get('X-Payment-URL'))
    }
    
    return response.json()
  } catch (error) {
    handlePaymentError(error)
  }
}
```

### **Webhook Integration**

```javascript
// Express.js webhook endpoint
app.post('/webhook/payment-success', (req, res) => {
  const { passId, transactionHash, provider } = req.body
  
  // Verify transaction on-chain
  const isValid = await verifyPassPurchase(transactionHash)
  
  if (isValid) {
    // Update database with new active pass
    await database.activePasses.create({
      tokenId: passId,
      provider: provider,
      status: 'active',
      purchaseHash: transactionHash
    })
    
    // Notify frontend of successful purchase
    res.status(200).json({ success: true })
  }
})
```

## 🏗️ Development Architecture

### **Project Structure**

```
FlexPass/
├── src/                          # Frontend React Application
│   ├── components/               # React Components
│   │   ├── Dashboard.tsx        # Main dashboard with active passes
│   │   ├── Header.tsx           # Navigation with wallet connection
│   │   ├── BuyFlow.tsx          # Provider selection and checkout
│   │   ├── PassCard.tsx         # Individual pass display with timers
│   │   ├── PassDetail.tsx       # Detailed pass view and management
│   │   ├── AdminConsole.tsx     # Provider management interface
│   │   ├── AdminLogin.tsx       # Secure admin authentication
│   │   ├── AdminRoute.tsx       # Protected admin route wrapper
│   │   ├── AddBalanceModal.tsx  # USDC faucet integration
│   │   ├── WalletConnect.tsx    # CDP wallet connection UI
│   │   └── services/            # Premium Service Clones
│   │       ├── SpotifyClone.tsx # Premium music streaming interface
│   │       └── ChatGPTClone.tsx # Premium AI chat interface
│   ├── hooks/                   # Custom React Hooks
│   │   ├── useCDPWallet.ts     # Coinbase Smart Wallet integration
│   │   ├── useFlexPass.ts      # Smart contract interactions
│   │   ├── useContract.ts      # Contract ABI and connections
│   │   ├── useAdminAuth.ts     # Admin authentication logic
│   │   └── useLocalStorage.ts  # Persistent storage utilities
│   ├── providers/              # React Context Providers
│   │   ├── CDPWalletProvider.tsx # Wallet state management
│   │   └── ThemeProvider.tsx   # Light/dark theme switching
│   ├── config/                 # Configuration Files
│   │   └── blockchain.ts       # Contract addresses and chain config
│   ├── data/                   # Mock Data and Constants
│   │   └── mockData.ts         # Sample providers and demo passes
│   └── types/                  # TypeScript Definitions
│       └── index.ts            # Core interfaces and types
├── server/                     # Backend Express Server
│   ├── lib/                    # Server Libraries
│   │   └── database.js         # PostgreSQL connection and queries
│   ├── prisma/                 # Database Schema and Migrations
│   │   ├── schema.prisma       # Database schema definition
│   │   └── seed.js             # Database seeding script
│   ├── examples/               # Usage Examples
│   │   └── database-usage.js   # Database operation examples
│   ├── .env                    # Server environment variables
│   └── server.js               # Express server with x402 middleware
├── contracts/                  # Smart Contracts
│   └── MicroSubscriptionPass.sol # ERC721 FlexPass contract
├── scripts/                    # Deployment Scripts
│   ├── deploy.js               # Contract deployment script
│   ├── deploy-hardhat.js       # Hardhat deployment
│   └── deploy-simple.js        # Simple deployment script
└── docs/                       # Documentation
    ├── DEPLOYMENT.md           # Deployment instructions
    └── DATABASE_SETUP.md       # Database setup guide
```

### **Key Components Explained**

#### **🎛️ Dashboard.tsx**
- Displays user's active and expired passes
- Real-time USDC balance from CDP wallet
- Quick access to premium service clones
- Pass management (extend, revoke, details)

#### **🏪 AdminConsole.tsx**
- Secure provider management interface
- Add/edit/delete service providers
- Revenue tracking and fund withdrawal
- Real-time provider statistics

#### **🎵 Service Clones**
- **SpotifyClone.tsx**: Premium music streaming with offline downloads
- **ChatGPTClone.tsx**: Advanced AI chat with premium features
- Pass-gated access with x402 verification
- Realistic premium feature demonstrations

#### **🔗 useFlexPass.ts Hook**
- Smart contract interaction layer
- Pass purchase, extend, and revoke functions
- USDC balance and allowance management
- LocalStorage fallback for offline demo

#### **💳 CDP Wallet Integration**
- Coinbase Smart Wallet creation and connection
- Base Sepolia network configuration
- USDC token interactions
- Transaction signing and confirmation

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## 🚀 Deployment

### Frontend Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist/` folder to your hosting provider:
   - **Vercel**: Connect GitHub repo for automatic deployments
   - **Netlify**: Drag and drop `dist/` folder
   - **IPFS**: Use Fleek or Pinata for decentralized hosting

### Smart Contract Deployment

1. Install Hardhat:
```bash
npm install --save-dev hardhat @nomiclabs/hardhat-ethers
```

2. Configure `hardhat.config.js` for Base Sepolia:
```javascript
module.exports = {
  networks: {
    baseSepolia: {
      url: 'https://sepolia.base.org',
      accounts: [process.env.PRIVATE_KEY]
    }
  }
}
```

3. Deploy and verify:
```bash
npx hardhat run scripts/deploy.js --network baseSepolia
npx hardhat verify CONTRACT_ADDRESS --network baseSepolia
```

## Security Considerations

- **Private Keys**: Never expose private keys or mnemonics
- **API Keys**: Store sensitive API keys in environment variables
- **Smart Contract**: Audit contract code before mainnet deployment
- **Access Control**: Validate all on-chain data before granting access

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

For support and questions:
- 🐛 **Bug Reports**: Create an issue in the GitHub repository
- 💡 **Feature Requests**: Use GitHub Discussions
- 📖 **Documentation**: Check the project wiki
- 💬 **Community**: Join our Discord server
- 📧 **Direct Contact**: Email the development team

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by the FlexPass team**

## 🗺️ Roadmap

### Phase 1: Core Platform ✅
- [x] FlexPass ERC721 smart contract with USDC payments
- [x] Coinbase Smart Wallet integration
- [x] Modern React dashboard with real-time updates
- [x] Provider management and admin console
- [x] X402 API access control system
- [x] Light/dark theme and accessibility features

### Phase 2: Production Deployment
- [ ] Base Mainnet smart contract deployment
- [ ] Real API integrations (OpenAI GPT-4, Spotify Web API)
- [ ] Production PostgreSQL database setup
- [ ] CDN deployment for global performance
- [ ] Advanced analytics and usage tracking
- [ ] Mobile PWA with offline support

### Phase 3: Platform Expansion
- [ ] Multi-chain support (Ethereum, Polygon, Arbitrum)
- [ ] Third-party provider SDK and documentation
- [ ] Revenue sharing program for service providers
- [ ] Pass marketplace for trading and gifting
- [ ] Enterprise partnerships and B2B integrations
- [ ] DAO governance for platform decisions

### Phase 4: Ecosystem Growth
- [ ] White-label solutions for other platforms
- [ ] Cross-chain pass portability
- [ ] AI-powered usage optimization
- [ ] Subscription bundling and family plans
- [ ] Integration with major Web2 platforms
- [ ] Global expansion with localized services

## 📊 Demo Features for Judges

**FlexPass is a complete Web3 micro-subscription platform ready for demonstration!** 🎉

### **🎯 Judge Demo Flow**

#### **1. Wallet Connection & Setup**
- Connect Coinbase Smart Wallet with one click
- Automatic Base Sepolia network detection
- Display USDC balance and wallet address
- Demo passes automatically loaded for testing

#### **2. Active Pass Dashboard**
- View active passes for Spotify (12h remaining) and ChatGPT (24h remaining)
- Real-time countdown timers with progress bars
- Direct access buttons to premium service clones
- Pass management options (extend, revoke, details)

#### **3. Premium Service Access**
- **Spotify Clone**: Ad-free music, offline downloads, unlimited skips
- **ChatGPT Clone**: Advanced AI chat, code generation, data analysis
- Pass verification before accessing premium features
- Realistic premium service demonstrations

#### **4. Pass Purchase Flow**
- Browse available service providers
- Select duration (hours/days) with dynamic pricing
- USDC approval and payment processing
- Instant pass activation and dashboard update

#### **5. Admin Console**
- Secure login (`admin` / `admin@123`)
- Add new service providers with real-time updates
- Monitor revenue and active pass statistics
- Provider management (edit, delete, activate)

### **🚀 Technical Highlights**

- ✅ **Coinbase CDP SDK**: Smart wallet integration with Base Sepolia
- ✅ **x402 Payment Middleware**: HTTP 402 protocol for API payments
- ✅ **ERC721 Smart Contract**: Flexible pass NFTs with USDC payments
- ✅ **PostgreSQL + Prisma**: Production-ready database layer
- ✅ **Real-time UI**: Live countdown timers and instant updates
- ✅ **Premium Service Clones**: Functional Spotify and ChatGPT demos
- ✅ **Admin Panel**: Complete provider management system
- ✅ **Responsive Design**: Mobile-friendly with dark/light themes
- ✅ **Error Handling**: Graceful fallbacks and user feedback
- ✅ **Accessibility**: WCAG compliant with keyboard navigation

### **💡 Innovation Points**

1. **Universal Pass System**: One pass, multiple premium services
2. **Blockchain-Verified Access**: On-chain validation for API endpoints
3. **Flexible Pricing**: Pay-per-hour model with precise USDC payments
4. **x402 Integration**: Industry-standard payment protocol implementation
5. **Smart Wallet UX**: Gasless transactions with social recovery
6. **Real-time Verification**: Instant pass validation and service access

The platform demonstrates the future of Web3 subscriptions with seamless UX, blockchain security, and innovative payment models!
