# IP-Fi Smart Contracts

Production-ready smart contracts for the IP-Fi fractional IP ownership platform.

## 🏗️ Architecture

### Core Contracts

1. **IPAssetNFT.sol** - NFT contract for IP assets
   - ERC-721 compliant NFTs representing unique IP assets
   - Fractional share management
   - Royalty distribution system
   - Investment tracking and management

2. **IPFiPlatform.sol** - Main platform contract  
   - User registration and management
   - Asset creation and listing
   - Investment processing
   - Investment pools
   - Platform statistics

3. **IPFiToken.sol** - Platform utility token
   - ERC-20 token for platform ecosystem
   - Staking mechanism with 12% APY
   - Governance and utility functions
   - Vesting for team and advisors

## 🚀 Features

### IPAssetNFT Features
- ✅ **Fractional Ownership** - Split IP assets into tradeable shares
- ✅ **Automated Royalty Distribution** - Proportional payouts to shareholders  
- ✅ **Flexible Asset Types** - Patents, art, music, trademarks, etc.
- ✅ **Investment Tracking** - Complete investment history per user
- ✅ **Access Control** - Role-based permissions for creators/investors
- ✅ **Emergency Functions** - Pausable and owner-controlled safety features

### IPFiPlatform Features
- ✅ **User Management** - Registration system for creators/investors
- ✅ **Asset Validation** - Supported asset types and value limits
- ✅ **Investment Pools** - Diversified investment opportunities
- ✅ **Platform Statistics** - Real-time analytics and metrics
- ✅ **Fee Management** - Configurable platform fees

### IPFiToken Features  
- ✅ **Staking Rewards** - 12% APY for token holders
- ✅ **Vesting System** - 2-year linear vesting for team/advisors
- ✅ **Community Incentives** - Reward distribution system
- ✅ **Governance Ready** - Token-based voting capabilities
- ✅ **Burn Mechanism** - Deflationary tokenomics

## 📊 Token Economics

- **Total Supply**: 1,000,000,000 IPFI tokens
- **Platform Reserve**: 30% (300M tokens)
- **Community Rewards**: 25% (250M tokens)  
- **Staking Rewards**: 20% (200M tokens)
- **Team & Advisors**: 15% (150M tokens) - 2-year vesting
- **Public Sale**: 10% (100M tokens)

## 🛠️ Development Setup

### Prerequisites
- Node.js v18+
- npm or yarn
- Git

### Installation
```bash
cd contracts
npm install
```

### Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Compile Contracts
```bash
npm run compile
```

### Run Tests
```bash
npm run test
```

### Deploy to Local Network
```bash
# Start local Hardhat node
npm run node

# Deploy contracts (in another terminal)
npm run deploy:local
```

### Deploy to Testnet
```bash
npm run deploy:testnet
```

### Deploy to Mainnet
```bash
npm run deploy:mainnet
```

## 🌐 Deployment

### Supported Networks
- **Local**: Hardhat local network (development)
- **Sepolia**: Ethereum testnet
- **Goerli**: Ethereum testnet (deprecated)
- **Mainnet**: Ethereum mainnet (production)
- **Polygon**: Polygon mainnet (lower fees)
- **Mumbai**: Polygon testnet

### Deployment Process

1. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Add your private key and API keys
   ```

2. **Deploy Contracts**:
   ```bash
   npm run deploy:sepolia  # For testnet
   npm run deploy:mainnet  # For production
   ```

3. **Verify Contracts**:
   ```bash
   npm run verify
   ```

4. **Update Backend**: Copy contract addresses to backend `.env`

## 🔧 Configuration

### Platform Settings
- **Platform Fee**: 2.5% (adjustable by owner)
- **Minimum Asset Value**: 0.01 ETH
- **Maximum Asset Value**: 1000 ETH  
- **Minimum Share Price**: 0.001 ETH

### Staking Parameters
- **APY**: 12% annual percentage yield
- **Minimum Duration**: 7 days
- **Reward Distribution**: Real-time calculation

### Supported Asset Types
- Digital Art & NFTs
- Patents & IP Rights
- Music Rights & Royalties
- Trademarks & Brands
- Copyright & Trade Secrets
- Character IP & Licensing
- Software & Code
- Industrial Design

## 🔒 Security Features

### Access Control
- **Owner Functions**: Critical operations restricted to contract owner
- **Creator Permissions**: Asset creators can manage their assets
- **Emergency Controls**: Pausable contracts for security incidents

### Economic Security  
- **Reentrancy Protection**: All external calls protected
- **Input Validation**: Comprehensive parameter validation
- **Safe Math**: OpenZeppelin's safe arithmetic operations
- **Rate Limiting**: Platform-level investment limits

### Audit Considerations
- OpenZeppelin standard contracts used
- Comprehensive test coverage
- Gas optimization implemented
- Emergency withdrawal functions

## 📈 Usage Examples

### Creating an IP Asset
```javascript
const tx = await ipfiPlatform.createAsset(
  "QmYourIPFSHash...",    // IPFS metadata hash
  10000,                   // Total shares  
  ethers.parseEther("0.01"), // Price per share (0.01 ETH)
  "digital-art",           // Asset type
  1000                     // 10% royalty rate
);
```

### Investing in an Asset
```javascript  
const tx = await ipfiPlatform.investInAsset(
  assetId,                 // Asset ID to invest in
  100,                     // Number of shares to buy
  { value: ethers.parseEther("1.0") } // Payment (1 ETH)
);
```

### Distributing Royalties
```javascript
const tx = await assetContract.distributeRoyalties(
  assetId,                 // Asset ID
  { value: ethers.parseEther("0.5") } // Royalty amount (0.5 ETH)
);
```

### Staking Tokens
```javascript
const tx = await ipfiToken.stakeTokens(
  ethers.parseEther("1000") // Stake 1000 IPFI tokens
);
```

## 🧪 Testing

### Run All Tests
```bash
npm run test
```

### Test Coverage
```bash
npm run coverage
```

### Gas Usage Analysis
```bash
REPORT_GAS=true npm run test
```

## 📜 Contract Verification

After deployment, verify contracts on block explorers:

```bash
# Verify all contracts
npm run verify

# Or individually
npx hardhat verify --network sepolia CONTRACT_ADDRESS "Constructor Args"
```

## 🚨 Emergency Procedures

### Pause Platform
```javascript
await ipfiPlatform.pauseAssetContract(); // Pause asset operations
await ipfiToken.setTransfersEnabled(false); // Pause token transfers
```

### Emergency Withdrawal
```javascript  
await contract.emergencyWithdraw(); // Withdraw stuck funds
```

## 📞 Support

- **Documentation**: See contract comments and NatSpec
- **Issues**: GitHub Issues
- **Security**: security@ipfi.com
- **Community**: Discord/Telegram

## 📄 License

MIT License - see LICENSE file for details.

---

**⚠️ Security Notice**: These contracts handle real value. Always test thoroughly on testnets before mainnet deployment. Consider professional security audits for production use.