# Web3 Micro-Subscription Pass - Deployment Guide

## Prerequisites

1. **Node.js and npm** installed
2. **Polygon Amoy Testnet MATIC** for gas fees
3. **API Keys** for external services

## Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update the following variables in `.env`:

### Required for Blockchain:
- `VITE_CONTRACT_ADDRESS`: Smart contract address (will be set after deployment)
- `VITE_ALCHEMY_API_KEY`: Your Alchemy API key for Polygon Amoy
- `PRIVATE_KEY`: Private key for contract deployment (keep secure!)

### Required for CDP Smart Wallet:
- `VITE_CDP_API_KEY`: Your CDP API key
- `VITE_CDP_API_SECRET`: Your CDP API secret  
- `VITE_CDP_PROJECT_ID`: Your CDP project ID

### Optional for External APIs:
- `VITE_OPENAI_API_KEY`: OpenAI API key for real ChatGPT access
- `VITE_SPOTIFY_CLIENT_ID`: Spotify client ID
- `VITE_SPOTIFY_CLIENT_SECRET`: Spotify client secret

## Smart Contract Deployment

### Option 1: Using Hardhat (Recommended)
```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to Polygon Amoy testnet
npx hardhat run scripts/deploy-hardhat.js --network polygonAmoy
```

### Option 2: Manual Deployment
1. Compile the Solidity contract using Remix or another tool
2. Deploy to Polygon Amoy testnet manually
3. Update `VITE_CONTRACT_ADDRESS` in `.env`

## Getting Test MATIC

Visit the [Polygon Faucet](https://faucet.polygon.technology/) to get free testnet MATIC for gas fees.

## Running the Application

```bash
# Start development server
npm run dev

# Open browser to http://localhost:5173
```

## Testing the Integration

1. **Connect Wallet**: Click "Connect Wallet" to connect your CDP Smart Wallet
2. **Check Balance**: Ensure you have MATIC for transactions
3. **Purchase Pass**: Try purchasing a subscription pass (requires MATIC)
4. **Access Content**: Use your active passes to access OpenAI, Spotify, or Netflix content
5. **Verify X402**: Check that API calls are properly authenticated with your blockchain pass

## Troubleshooting

### Common Issues:

1. **"Contract Not Deployed"**: 
   - Ensure `VITE_CONTRACT_ADDRESS` is set in `.env`
   - Verify the contract is deployed to Polygon Amoy testnet

2. **Transaction Failures**:
   - Check you have sufficient MATIC balance
   - Verify you're connected to Polygon Amoy testnet (Chain ID: 80002)

3. **API Access Denied**:
   - Ensure your pass is valid and not expired
   - Check that X402 authentication is working

4. **Wallet Connection Issues**:
   - Clear browser cache and localStorage
   - Ensure CDP API keys are correctly set

## Security Notes

- Never commit your `.env` file
- Keep private keys secure
- Use testnet for development only
- Regularly rotate API keys

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Blockchain**: Polygon Amoy testnet
- **Wallet**: CDP Smart Wallet SDK
- **Authentication**: CDP X402 for API access control
- **Smart Contract**: ERC-721 based subscription passes
