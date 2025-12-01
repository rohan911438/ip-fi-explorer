# 🎯 Remix Deployment Guide for IP-Fi Smart Contracts

## 📋 Step-by-Step Deployment Process

### 1. **Open Remix IDE**
   - Go to: https://remix.ethereum.org/
   - Create new workspace or use default

### 2. **Upload Contract Files**
   Upload these files from `contracts/remix-ready/` folder:
   - `IPFiToken_Remix.sol`
   - `IPAssetNFT_Remix.sol` 
   - `IPFiPlatform_Remix.sol`

### 3. **Deployment Order** (IMPORTANT!)

#### **Step 3a: Deploy IPFiToken**
1. Select `IPFiToken_Remix.sol`
2. Compile (Solidity version: 0.8.20+)
3. Go to Deploy tab
4. Select network (Sepolia testnet recommended)
5. Deploy with constructor parameters:
   - No parameters needed
6. **Save the contract address** ✏️

#### **Step 3b: Deploy IPAssetNFT**
1. Select `IPAssetNFT_Remix.sol`
2. Compile
3. Deploy with constructor parameters:
   - `name`: "IP-Fi Asset NFT"
   - `symbol`: "IPFA"
   - `_feeRecipient`: Your wallet address
4. **Save the contract address** ✏️

#### **Step 3c: Deploy IPFiPlatform**
1. Select `IPFiPlatform_Remix.sol`
2. Compile
3. Deploy with constructor parameters:
   - `_assetContract`: IPAssetNFT contract address from Step 3b
4. **Save the contract address** ✏️

### 4. **Post-Deployment Configuration**

#### **Step 4a: Transfer IPAssetNFT Ownership**
1. In IPAssetNFT contract, call `transferOwnership`
2. Parameter: IPFiPlatform contract address
3. This allows the platform to mint new assets

#### **Step 4b: Authorize Platform for Token Minting**
1. In IPFiToken contract, call `authorizeMinter`
2. Parameter: IPFiPlatform contract address
3. This allows platform to distribute rewards

### 5. **Get Contract ABIs**

After deployment, copy the ABI for each contract:
1. Go to `contracts/artifacts/ContractName.sol/` in Remix
2. Copy the `abi` section from the JSON
3. Save these ABIs for backend integration

## 📝 Contract Addresses Template

After deployment, you'll have these addresses:

```
IPFiToken Address:     0x...
IPAssetNFT Address:    0x...  
IPFiPlatform Address:  0x...
Network:               Sepolia (or your chosen network)
Chain ID:              11155111 (Sepolia)
```

## 🔑 ABI Keys Template

### IPAssetNFT ABI (Key Functions)
```json
[
  "function mintIPAsset(address creator, string ipfsHash, uint256 totalShares, uint256 pricePerShare, string assetType, uint256 royaltyRate) returns (uint256)",
  "function purchaseShares(uint256 tokenId, uint256 shareCount) payable",
  "function getAsset(uint256 tokenId) view returns (tuple(address creator, string ipfsHash, uint256 totalShares, uint256 availableShares, uint256 pricePerShare, uint256 totalRaised, bool isListed, string assetType, uint256 createdAt, uint256 royaltyRate))",
  "function getInvestment(uint256 tokenId, address investor) view returns (tuple(uint256 shares, uint256 amountInvested, uint256 lastRoyaltyPayout, uint256 totalRoyaltiesReceived))",
  "function distributeRoyalties(uint256 tokenId) payable"
]
```

### IPFiPlatform ABI (Key Functions)
```json
[
  "function registerUser(string userType)",
  "function createAsset(string ipfsHash, uint256 totalShares, uint256 pricePerShare, string assetType, uint256 royaltyRate) returns (uint256)",
  "function investInAsset(uint256 assetId, uint256 shareCount) payable",
  "function getPlatformStats() view returns (tuple(uint256 totalAssets, uint256 totalInvestments, uint256 totalValueLocked, uint256 totalRoyaltiesDistributed, uint256 totalUsers))"
]
```

### IPFiToken ABI (Key Functions)
```json
[
  "function balanceOf(address account) view returns (uint256)",
  "function stakeTokens(uint256 amount)",
  "function unstakeTokens(uint256 amount)", 
  "function claimRewards()",
  "function pendingRewards(address user) view returns (uint256)",
  "function getStakingInfo(address user) view returns (tuple(uint256 stakedAmount, uint256 stakingStartTime, uint256 lastRewardClaim, uint256 totalRewardsEarned))"
]
```

## 🌐 Network Configuration

### Sepolia Testnet (Recommended)
- Network Name: Sepolia
- RPC URL: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
- Chain ID: 11155111
- Currency: SepoliaETH
- Block Explorer: https://sepolia.etherscan.io/

### Get Testnet ETH
- Sepolia Faucet: https://sepoliafaucet.com/
- Need ~0.1 ETH for deployment

## 🧪 Test Your Deployment

### Basic Testing Sequence:

1. **Register as User**
   ```
   IPFiPlatform.registerUser("both")
   ```

2. **Create Test Asset**
   ```
   IPFiPlatform.createAsset(
     "QmTestHash123",     // IPFS hash
     1000,                // total shares
     1000000000000000,    // price per share (0.001 ETH in wei)
     "digital-art",       // asset type
     1000                 // 10% royalty rate
   )
   ```

3. **Test Investment**
   ```
   IPFiPlatform.investInAsset(
     1,           // asset ID  
     100,         // share count
     {value: 100000000000000000} // 0.1 ETH payment
   )
   ```

## 🔄 Backend Integration

Once deployed, update your backend `.env` file:

```env
# Add these new environment variables
IPFI_TOKEN_ADDRESS=0xYourTokenAddress
IP_ASSET_NFT_ADDRESS=0xYourNFTAddress
IPFI_PLATFORM_ADDRESS=0xYourPlatformAddress

# Network configuration  
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
DEPLOYMENT_NETWORK=sepolia
DEPLOYMENT_CHAIN_ID=11155111

# Keep existing blockchain config
PRIVATE_KEY=your-wallet-private-key
```

## ⚠️ Important Notes

- **Deploy in order**: Token → NFT → Platform
- **Configure ownership**: Transfer NFT ownership to Platform
- **Authorize minting**: Allow Platform to mint tokens
- **Save everything**: Addresses, ABIs, transaction hashes
- **Test thoroughly**: Run test transactions before production use

## 🎉 Success Checklist

- [ ] All 3 contracts deployed successfully
- [ ] Ownership transferred to platform
- [ ] Minting authorized for platform
- [ ] Test user registration works
- [ ] Test asset creation works
- [ ] Test investment works
- [ ] Contract addresses saved
- [ ] ABIs copied for backend
- [ ] Backend .env updated

Once you have the contract addresses and ABIs, I'll help you integrate them with your backend! 🚀

## 🆘 Troubleshooting

**Gas Limit Issues**: Increase gas limit to 3,000,000+
**Constructor Errors**: Double-check parameter types and values
**Compilation Errors**: Ensure Solidity version 0.8.20+
**Network Issues**: Make sure you're connected to the right network

After deployment, share your contract addresses and I'll help you complete the integration!