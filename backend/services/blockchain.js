import { ethers } from 'ethers';
import { logger } from '../utils/logger.js';

let provider;
let wallet;
let storyProtocolContract;

// Initialize blockchain services
export const initializeBlockchain = async () => {
  try {
    // Check if blockchain configuration is provided
    const rpcUrl = process.env.ETHEREUM_RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.STORY_PROTOCOL_CONTRACT_ADDRESS;
    
    // Skip initialization if using placeholder values
    if (!rpcUrl || rpcUrl.includes('your-infura-project-id') ||
        !privateKey || privateKey.includes('your-private-key-for-contract-interactions') ||
        !contractAddress || contractAddress === '0x1234567890123456789012345678901234567890') {
      logger.warn('⚠️ Blockchain service skipped - using placeholder configuration');
      logger.info('💡 Update .env file with real blockchain credentials to enable blockchain features');
      return;
    }
    
    // Initialize provider
    provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Initialize wallet
    if (privateKey) {
      wallet = new ethers.Wallet(privateKey, provider);
    }

    // Contract ABI (simplified - you'll need the full ABI from Story Protocol)
    const contractABI = [
      "function mintIPToken(address to, string memory tokenURI) public returns (uint256)",
      "function transferShares(uint256 tokenId, address to, uint256 shares) public",
      "function getTokenInfo(uint256 tokenId) public view returns (address owner, uint256 totalShares, uint256 availableShares)",
      "function distributeRoyalties(uint256 tokenId) public payable"
    ];

    // Initialize Story Protocol contract
    if (contractAddress) {
      storyProtocolContract = new ethers.Contract(
        contractAddress,
        contractABI,
        wallet
      );
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