# IP-Fi Smart Contract Deployment Guide

## 🚀 Quick Deployment

### 1. Setup Environment
```bash
cd contracts
npm install
cp .env.example .env
```

### 2. Configure Environment Variables
Edit `.env` file with your credentials:
```env
PRIVATE_KEY=your-wallet-private-key-here
INFURA_PROJECT_ID=your-infura-project-id
ETHERSCAN_API_KEY=your-etherscan-api-key
```

### 3. Deploy to Testnet (Sepolia)
```bash
npm run deploy:testnet
```

### 4. Deploy to Mainnet
```bash
npm run deploy:mainnet
```

### 5. Update Backend Configuration
Copy the contract addresses from deployment output to your backend `.env`:
```env
IPFI_TOKEN_ADDRESS=0x...
IP_ASSET_NFT_ADDRESS=0x...  
IPFI_PLATFORM_ADDRESS=0x...
```

## 📋 Detailed Steps

### Prerequisites
- Node.js v18+
- Wallet with sufficient ETH for deployment and gas fees
- Infura project ID or other RPC provider
- Etherscan API key for contract verification

### Network Requirements

**Sepolia Testnet:**
- ~0.1 ETH for deployment
- Free testnet ETH: https://sepoliafaucet.com/

**Ethereum Mainnet:**
- ~0.5-1 ETH for deployment (depends on gas prices)
- Additional ETH for initial platform operations

**Polygon (Alternative):**
- ~10-50 MATIC for deployment
- Much lower gas costs

### Contract Deployment Order

1. **IPFiToken** - Platform utility token
2. **IPAssetNFT** - NFT contract for IP assets
3. **IPFiPlatform** - Main platform orchestrator

The deployment script handles this automatically.

### Post-Deployment Configuration

The deployment script automatically:
- ✅ Transfers IPAssetNFT ownership to IPFiPlatform
- ✅ Authorizes IPFiPlatform as token minter
- ✅ Sets up initial configuration
- ✅ Generates environment files

### Verification

After deployment, verify contracts on Etherscan:
```bash
# Automatic verification (included in deployment)
npm run verify

# Manual verification if needed
npx hardhat verify --network sepolia CONTRACT_ADDRESS "Constructor Args"
```

## 🔧 Configuration Parameters

### IPAssetNFT
- Platform Fee: 2.5% (adjustable)
- Maximum Royalty Rate: 50%
- Fee Recipient: Deployer address

### IPFiPlatform  
- Minimum Asset Value: 0.01 ETH
- Maximum Asset Value: 1000 ETH
- Minimum Share Price: 0.001 ETH
- Supported Asset Types: Pre-configured list

### IPFiToken
- Total Supply: 1 billion tokens
- Staking APY: 12%
- Minimum Stake Duration: 7 days
- Vesting Period: 2 years with 6-month cliff

## 🏷️ Supported Networks

### Testnets
```bash
npm run deploy:testnet  # Sepolia
```

### Mainnets
```bash
npm run deploy:mainnet  # Ethereum
```

### Custom Networks
Add to `hardhat.config.js`:
```javascript
networks: {
  customNetwork: {
    url: "https://your-rpc-url",
    accounts: [PRIVATE_KEY],
    chainId: YOUR_CHAIN_ID
  }
}
```

## 💰 Cost Estimation

### Gas Usage (Approximate)
- **IPFiToken**: ~3,000,000 gas
- **IPAssetNFT**: ~4,500,000 gas  
- **IPFiPlatform**: ~3,500,000 gas
- **Total**: ~11,000,000 gas

### Cost Examples (30 gwei gas price)
- **Ethereum**: ~$100-200 USD
- **Polygon**: ~$5-10 USD
- **Testnet**: Free (testnet ETH)

## 🔍 Contract Addresses

After successful deployment, you'll receive:

```
🎉 Deployment Summary:
═══════════════════════════════════════
📄 IPFiToken:      0x1234...
🖼️  IPAssetNFT:     0x5678...
🏛️  IPFiPlatform:   0x9abc...
💼 Deployer:       0xdef0...
⛓️  Network:        sepolia
═══════════════════════════════════════
```

## 🛡️ Security Checklist

Before mainnet deployment:
- [ ] Review all contract code
- [ ] Run comprehensive tests
- [ ] Verify constructor parameters
- [ ] Check access controls
- [ ] Confirm fee configurations
- [ ] Test on testnet first
- [ ] Consider professional audit

## 🧪 Testing

### Run Tests
```bash
npm run test
```

### Test Coverage
```bash
npm run coverage
```

### Gas Report
```bash
REPORT_GAS=true npm run test
```

## 🔄 Updates and Upgrades

These contracts are **not upgradeable** by design for security. For updates:

1. Deploy new versions
2. Migrate platform data
3. Update frontend/backend addresses
4. Communicate changes to users

## 📞 Troubleshooting

### Common Issues

**"Insufficient funds for intrinsic transaction cost"**
- Solution: Add more ETH to deployment wallet

**"Replacement transaction underpriced"**
- Solution: Increase gas price or wait for transaction to complete

**"Contract creation code storage out of gas"**
- Solution: Optimize contracts or increase gas limit

**"UNPREDICTABLE_GAS_LIMIT"**
- Solution: Check constructor parameters and network connectivity

### Debug Mode
```bash
DEBUG=* npm run deploy:testnet
```

### Verify Deployment
```bash
# Check contract exists
npx hardhat verify --list-networks
npx hardhat run scripts/verify-deployment.js --network sepolia
```

## 📁 File Structure After Deployment

```
contracts/
├── deployments/
│   ├── sepolia.json      # Deployment info
│   ├── mainnet.json      # Production deployment
│   └── .env.contracts    # Contract addresses
├── artifacts/            # Compiled contracts
├── cache/               # Hardhat cache
└── src/                 # Source contracts
```

## 🔗 Integration with Backend

After deployment, update your backend `.env`:

```env
# From deployments/.env.contracts
IPFI_TOKEN_ADDRESS=0x...
IP_ASSET_NFT_ADDRESS=0x...
IPFI_PLATFORM_ADDRESS=0x...
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

Restart your backend server to connect to deployed contracts.

## ✅ Deployment Checklist

Pre-deployment:
- [ ] Environment variables configured
- [ ] Sufficient ETH in wallet
- [ ] Tests passing
- [ ] Network configured correctly

Post-deployment:
- [ ] Contracts verified on block explorer
- [ ] Backend updated with addresses
- [ ] Frontend configured
- [ ] Test basic functionality
- [ ] Document addresses securely

Your IP-Fi smart contracts are now ready for production use! 🎉