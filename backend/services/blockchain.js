import { ethers } from 'ethers';
import { logger } from '../utils/logger.js';

let provider;
let wallet;
let storyProtocolContract;

// Initialize blockchain services for Story Protocol
export const initializeBlockchain = async () => {
  try {
    // Use Story testnet configuration
    const rpcUrl = process.env.STORY_TESTNET_RPC || 'https://rpc-story-testnet.rockx.com';
    const privateKey = process.env.PRIVATE_KEY;
    
    // Check if we have the required configuration
    if (!privateKey || privateKey.includes('your-private-key')) {
      logger.warn('⚠️ Blockchain service skipped - private key not configured');
      logger.info('💡 Update .env file with real private key to enable blockchain features');
      return;
    }
    
    // Initialize provider for Story testnet
    provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Initialize wallet
    if (privateKey) {
      wallet = new ethers.Wallet(privateKey, provider);
    }

    // Story Protocol contract addresses
    const storyContracts = {
      IPAssetRegistry: process.env.STORY_IP_ASSET_REGISTRY,
      LicensingModule: process.env.STORY_LICENSING_MODULE,
      RoyaltyModule: process.env.STORY_ROYALTY_MODULE,
      LicenseRegistry: process.env.STORY_LICENSE_REGISTRY,
      LicenseToken: process.env.STORY_LICENSE_TOKEN,
      PILicenseTemplate: process.env.STORY_PIL_LICENSE_TEMPLATE,
      GroupingModule: process.env.STORY_GROUPING_MODULE,
      DisputeModule: process.env.STORY_DISPUTE_MODULE,
      CoreMetadataModule: process.env.STORY_CORE_METADATA_MODULE
    };

    // Basic Story Protocol ABIs (simplified for demonstration)
    const storyABI = [
      "function totalSupply() external view returns (uint256)",
      "function balanceOf(address owner) external view returns (uint256)",
      "function tokenURI(uint256 tokenId) external view returns (string memory)",
      "function register(address ipId, uint256 chainid, address tokenContract, uint256 tokenId) external",
      "function ipId(uint256 chainId, address tokenContract, uint256 tokenId) external pure returns (address)"
    ];

    // Initialize Story Protocol contracts
    global.storyContracts = {};
    
    Object.entries(storyContracts).forEach(([name, address]) => {
      if (address && ethers.isAddress(address)) {
        global.storyContracts[name] = new ethers.Contract(address, storyABI, wallet);
        logger.info(`✅ ${name} contract initialized at ${address}`);
      }
    });

    // Set main Story Protocol contract reference
    if (storyContracts.IPAssetRegistry) {
      storyProtocolContract = global.storyContracts.IPAssetRegistry;
    }

    logger.info('✅ Blockchain services initialized successfully');
  } catch (error) {
    logger.error('Blockchain initialization failed:', error);
    logger.warn('⚠️ Blockchain features will be disabled');
    // Don't throw error - allow server to start without blockchain
  }
};

// Get current gas price
export const getCurrentGasPrice = async () => {
  try {
    if (!provider) {
      throw new Error('Blockchain not initialized');
    }
    const gasPrice = await provider.getFeeData();
    return gasPrice;
  } catch (error) {
    logger.error('Failed to get gas price:', error);
    throw error;
  }
};

// Mint IP token on blockchain
export const mintIPToken = async (assetData) => {
  try {
    if (!storyProtocolContract || !wallet) {
      throw new Error('Blockchain not initialized');
    }

    const tokenURI = JSON.stringify({
      name: assetData.title,
      description: assetData.description,
      image: assetData.primaryImage,
      properties: {
        type: assetData.type,
        creator: assetData.creator,
        totalShares: assetData.totalShares
      }
    });

    const tx = await storyProtocolContract.mintIPToken(
      assetData.creatorWallet,
      tokenURI
    );

    const receipt = await tx.wait();
    
    logger.info(`IP token minted: ${tx.hash}`);
    
    return {
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      tokenId: receipt.logs[0]?.topics[3] // Assuming the tokenId is in the first log
    };
  } catch (error) {
    logger.error('IP token minting failed:', error);
    throw error;
  }
};

// Transfer shares on blockchain
export const transferShares = async (tokenId, fromWallet, toWallet, shares) => {
  try {
    if (!storyProtocolContract) {
      throw new Error('Blockchain not initialized');
    }

    const tx = await storyProtocolContract.transferShares(
      tokenId,
      toWallet,
      shares
    );

    const receipt = await tx.wait();
    
    logger.info(`Shares transferred: ${tx.hash}`);
    
    return {
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    logger.error('Share transfer failed:', error);
    throw error;
  }
};

// Distribute royalties on blockchain
export const distributeRoyalties = async (tokenId, amount) => {
  try {
    if (!storyProtocolContract) {
      throw new Error('Blockchain not initialized');
    }

    const tx = await storyProtocolContract.distributeRoyalties(tokenId, {
      value: ethers.parseEther(amount.toString())
    });

    const receipt = await tx.wait();
    
    logger.info(`Royalties distributed: ${tx.hash}`);
    
    return {
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    logger.error('Royalty distribution failed:', error);
    throw error;
  }
};

// Verify wallet signature
export const verifyWalletSignature = (message, signature, walletAddress) => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    logger.error('Signature verification failed:', error);
    return false;
  }
};

// Get token balance
export const getTokenBalance = async (walletAddress, tokenId) => {
  try {
    if (!storyProtocolContract) {
      throw new Error('Blockchain not initialized');
    }

    const tokenInfo = await storyProtocolContract.getTokenInfo(tokenId);
    return tokenInfo;
  } catch (error) {
    logger.error('Failed to get token balance:', error);
    throw error;
  }
};

// Listen for blockchain events
export const startEventListeners = () => {
  if (!storyProtocolContract) {
    logger.warn('Cannot start event listeners - contract not initialized');
    return;
  }

  // Listen for token minting events
  storyProtocolContract.on('Transfer', (from, to, tokenId, event) => {
    if (from === ethers.ZeroAddress) {
      logger.info(`New IP token minted: ${tokenId}`);
      // Emit to websocket clients
      if (global.io) {
        global.io.emit('token-minted', { tokenId: tokenId.toString() });
      }
    }
  });

  // Listen for share transfer events
  storyProtocolContract.on('SharesTransferred', (tokenId, from, to, shares, event) => {
    logger.info(`Shares transferred for token ${tokenId}`);
    // Emit to websocket clients
    if (global.io) {
      global.io.emit('shares-transferred', { 
        tokenId: tokenId.toString(), 
        from, 
        to, 
        shares: shares.toString() 
      });
    }
  });

  logger.info('✅ Blockchain event listeners started');
};

// Get ETH to USD conversion rate
export const getETHtoUSD = async () => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const data = await response.json();
    return data.ethereum.usd;
  } catch (error) {
    logger.error('Failed to get ETH price:', error);
    return 3000; // Fallback price
  }
};

// Create IP asset on blockchain
export const createIPAsset = async (assetData) => {
  try {
    if (!storyProtocolContract || !wallet) {
      throw new Error('Blockchain not initialized');
    }

    const { ipfsHash, totalShares, pricePerShare, assetType, royaltyRate } = assetData;
    
    const tx = await storyProtocolContract.createAsset(
      ipfsHash,
      totalShares,
      ethers.parseEther(pricePerShare.toString()),
      assetType,
      royaltyRate * 100 // Convert to basis points
    );

    const receipt = await tx.wait();
    logger.info('Asset created on blockchain:', receipt.hash);
    return receipt;
  } catch (error) {
    logger.error('Failed to create asset on blockchain:', error);
    throw error;
  }
};

// Invest in asset on blockchain
export const investInAssetOnChain = async (assetId, shareCount, paymentAmount) => {
  try {
    if (!storyProtocolContract || !wallet) {
      throw new Error('Blockchain not initialized');
    }

    const tx = await storyProtocolContract.investInAsset(
      assetId,
      shareCount,
      { value: ethers.parseEther(paymentAmount.toString()) }
    );

    const receipt = await tx.wait();
    logger.info('Investment completed on blockchain:', receipt.hash);
    return receipt;
  } catch (error) {
    logger.error('Failed to invest on blockchain:', error);
    throw error;
  }
};

// Get asset details from blockchain
export const getAssetFromChain = async (assetId) => {
  try {
    if (!global.assetNFTContract) {
      throw new Error('Asset NFT contract not initialized');
    }

    const asset = await global.assetNFTContract.getAsset(assetId);
    return {
      creator: asset.creator,
      ipfsHash: asset.ipfsHash,
      totalShares: asset.totalShares.toString(),
      availableShares: asset.availableShares.toString(),
      pricePerShare: ethers.formatEther(asset.pricePerShare),
      totalRaised: ethers.formatEther(asset.totalRaised),
      isListed: asset.isListed,
      assetType: asset.assetType,
      createdAt: asset.createdAt.toString(),
      royaltyRate: asset.royaltyRate.toString()
    };
  } catch (error) {
    logger.error('Failed to get asset from blockchain:', error);
    throw error;
  }
};

// Get IPFI token balance
export const getIPFITokenBalance = async (userAddress) => {
  try {
    if (!global.tokenContract) {
      throw new Error('Token contract not initialized');
    }

    const balance = await global.tokenContract.balanceOf(userAddress);
    return ethers.formatEther(balance);
  } catch (error) {
    logger.error('Failed to get IPFI token balance:', error);
    throw error;
  }
};

// Get platform statistics from blockchain
export const getPlatformStatsFromChain = async () => {
  try {
    if (!storyProtocolContract) {
      throw new Error('Platform contract not initialized');
    }

    const stats = await storyProtocolContract.getPlatformStats();
    return {
      totalAssets: stats.totalAssets.toString(),
      totalInvestments: stats.totalInvestments.toString(),
      totalValueLocked: ethers.formatEther(stats.totalValueLocked),
      totalRoyaltiesDistributed: ethers.formatEther(stats.totalRoyaltiesDistributed),
      totalUsers: stats.totalUsers.toString()
    };
  } catch (error) {
    logger.error('Failed to get platform stats from blockchain:', error);
    throw error;
  }
};