# 📋 Contract ABIs for Backend Integration

After deploying your contracts in Remix, copy these ABI arrays for your backend integration:

## 🎨 IPAssetNFT Contract ABI

```json
[
  {
    "inputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "symbol", "type": "string"},
      {"internalType": "address", "name": "_feeRecipient", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "creator", "type": "address"},
      {"internalType": "string", "name": "ipfsHash", "type": "string"},
      {"internalType": "uint256", "name": "totalShares", "type": "uint256"},
      {"internalType": "uint256", "name": "pricePerShare", "type": "uint256"},
      {"internalType": "string", "name": "assetType", "type": "string"},
      {"internalType": "uint256", "name": "royaltyRate", "type": "uint256"}
    ],
    "name": "mintIPAsset",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"internalType": "uint256", "name": "shareCount", "type": "uint256"}
    ],
    "name": "purchaseShares",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "getAsset",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "creator", "type": "address"},
          {"internalType": "string", "name": "ipfsHash", "type": "string"},
          {"internalType": "uint256", "name": "totalShares", "type": "uint256"},
          {"internalType": "uint256", "name": "availableShares", "type": "uint256"},
          {"internalType": "uint256", "name": "pricePerShare", "type": "uint256"},
          {"internalType": "uint256", "name": "totalRaised", "type": "uint256"},
          {"internalType": "bool", "name": "isListed", "type": "bool"},
          {"internalType": "string", "name": "assetType", "type": "string"},
          {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
          {"internalType": "uint256", "name": "royaltyRate", "type": "uint256"}
        ],
        "internalType": "struct IPAssetNFT.IPAsset",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"internalType": "address", "name": "investor", "type": "address"}
    ],
    "name": "getInvestment",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "shares", "type": "uint256"},
          {"internalType": "uint256", "name": "amountInvested", "type": "uint256"},
          {"internalType": "uint256", "name": "lastRoyaltyPayout", "type": "uint256"},
          {"internalType": "uint256", "name": "totalRoyaltiesReceived", "type": "uint256"}
        ],
        "internalType": "struct IPAssetNFT.Investment",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "distributeRoyalties",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "getAssetInvestors",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "creator", "type": "address"}],
    "name": "getCreatorAssets",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "investor", "type": "address"}],
    "name": "getInvestorAssets",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  }
]
```

## 🏛️ IPFiPlatform Contract ABI

```json
[
  {
    "inputs": [{"internalType": "address", "name": "_assetContract", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "string", "name": "userType", "type": "string"}],
    "name": "registerUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "ipfsHash", "type": "string"},
      {"internalType": "uint256", "name": "totalShares", "type": "uint256"},
      {"internalType": "uint256", "name": "pricePerShare", "type": "uint256"},
      {"internalType": "string", "name": "assetType", "type": "string"},
      {"internalType": "uint256", "name": "royaltyRate", "type": "uint256"}
    ],
    "name": "createAsset",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "assetId", "type": "uint256"},
      {"internalType": "uint256", "name": "shareCount", "type": "uint256"}
    ],
    "name": "investInAsset",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "assetId", "type": "uint256"}],
    "name": "payRoyalties",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPlatformStats",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "totalAssets", "type": "uint256"},
          {"internalType": "uint256", "name": "totalInvestments", "type": "uint256"},
          {"internalType": "uint256", "name": "totalValueLocked", "type": "uint256"},
          {"internalType": "uint256", "name": "totalRoyaltiesDistributed", "type": "uint256"},
          {"internalType": "uint256", "name": "totalUsers", "type": "uint256"}
        ],
        "internalType": "struct IPFiPlatform.PlatformStats",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSupportedAssetTypes",
    "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "isUserRegistered",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
]
```

## 💎 IPFiToken Contract ABI

```json
[
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "stakeTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "unstakeTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "pendingRewards",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getStakingInfo",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "stakedAmount", "type": "uint256"},
          {"internalType": "uint256", "name": "stakingStartTime", "type": "uint256"},
          {"internalType": "uint256", "name": "lastRewardClaim", "type": "uint256"},
          {"internalType": "uint256", "name": "totalRewardsEarned", "type": "uint256"}
        ],
        "internalType": "struct IPFiToken.StakingInfo",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "recipient", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "mintCommunityRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
```

## 📝 Backend Integration Template

Once you deploy and get your contract addresses, update your backend `/services/blockchain.js`:

```javascript
// Contract addresses (replace with your deployed addresses)
const CONTRACT_ADDRESSES = {
  IPFI_TOKEN: "0xYOUR_TOKEN_ADDRESS",
  IP_ASSET_NFT: "0xYOUR_NFT_ADDRESS", 
  IPFI_PLATFORM: "0xYOUR_PLATFORM_ADDRESS"
};

// Contract ABIs (use the ABIs above)
const CONTRACT_ABIS = {
  IPFI_TOKEN: [...], // Copy from above
  IP_ASSET_NFT: [...], // Copy from above
  IPFI_PLATFORM: [...] // Copy from above
};
```

## 🔧 Quick Integration Steps

1. **Deploy contracts in Remix**
2. **Copy contract addresses**
3. **Update backend .env file**:
   ```env
   IPFI_TOKEN_ADDRESS=0x...
   IP_ASSET_NFT_ADDRESS=0x...
   IPFI_PLATFORM_ADDRESS=0x...
   ```
4. **Use ABIs above in your backend code**

That's it! Your contracts will be integrated and ready to use. 🚀

## 🧪 Test Functions After Integration

```javascript
// Test contract connectivity
await platformContract.getPlatformStats();

// Test user registration  
await platformContract.registerUser("both");

// Test asset creation
await platformContract.createAsset("QmTest", 1000, ethers.parseEther("0.001"), "digital-art", 1000);
```

Once you have your deployed contract addresses, just let me know and I'll help you complete the backend integration! 🎯