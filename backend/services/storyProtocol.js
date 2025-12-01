import { ethers } from 'ethers';
import { logger } from '../utils/logger.js';

class StoryProtocolService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contracts = {};
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(
        process.env.STORY_TESTNET_RPC || 'https://rpc-story-testnet.rockx.com'
      );

      // Initialize wallet
      if (process.env.PRIVATE_KEY) {
        this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
      }

      // Story Protocol contract addresses
      const contractAddresses = {
        IPAssetRegistry: process.env.STORY_IP_ASSET_REGISTRY,
        LicensingModule: process.env.STORY_LICENSING_MODULE,
        RoyaltyModule: process.env.STORY_ROYALTY_MODULE,
        LicenseRegistry: process.env.STORY_LICENSE_REGISTRY,
        LicenseToken: process.env.STORY_LICENSE_TOKEN,
        PILicenseTemplate: process.env.STORY_PIL_LICENSE_TEMPLATE,
        GroupingModule: process.env.STORY_GROUPING_MODULE,
        CoreMetadataModule: process.env.STORY_CORE_METADATA_MODULE
      };

      // Initialize contract instances
      await this.initializeContracts(contractAddresses);
      
      this.isInitialized = true;
      logger.info('✅ Story Protocol service initialized successfully');

    } catch (error) {
      logger.error('Failed to initialize Story Protocol service:', error);
      throw error;
    }
  }

  async initializeContracts(addresses) {
    // Basic ABI for Story Protocol interactions
    const storyABI = [
      // IPAssetRegistry functions
      "function register(uint256 chainId, address tokenContract, uint256 tokenId) external returns (address)",
      "function ipId(uint256 chainId, address tokenContract, uint256 tokenId) external view returns (address)",
      "function isRegistered(address ipId) external view returns (bool)",
      
      // LicensingModule functions  
      "function attachLicenseTerms(address ipId, address licenseTemplate, bytes calldata licenseTermsData) external",
      "function mintLicenseTokens(address licensorIpId, address licenseTemplate, bytes calldata licenseTermsData, uint256 amount, address receiver) external returns (uint256[] memory licenseTokenIds)",
      
      // RoyaltyModule functions
      "function payRoyaltyOnBehalf(address receiverIpId, address payerIpId, address token, uint256 amount) external",
      "function claimableRevenue(address ipId, address asset, address user) external view returns (uint256)",
      "function claimRevenue(address ipId, address asset) external",
      
      // Standard functions
      "function totalSupply() external view returns (uint256)",
      "function balanceOf(address owner) external view returns (uint256)"
    ];

    Object.entries(addresses).forEach(([name, address]) => {
      if (address && ethers.isAddress(address)) {
        this.contracts[name] = new ethers.Contract(
          address,
          storyABI,
          this.wallet || this.provider
        );
      }
    });
  }

  // Register an IP asset on Story Protocol
  async registerIPAsset(tokenContract, tokenId) {
    try {
      if (!this.contracts.IPAssetRegistry) {
        throw new Error('IPAssetRegistry contract not initialized');
      }

      const chainId = (await this.provider.getNetwork()).chainId;
      const tx = await this.contracts.IPAssetRegistry.register(
        chainId,
        tokenContract,
        tokenId
      );
      
      const receipt = await tx.wait();
      logger.info(`IP Asset registered: ${receipt.transactionHash}`);
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        ipId: await this.contracts.IPAssetRegistry.ipId(chainId, tokenContract, tokenId)
      };

    } catch (error) {
      logger.error('Failed to register IP asset:', error);
      return { success: false, error: error.message };
    }
  }

  // Attach license terms to an IP asset
  async attachLicenseTerms(ipId, licenseData) {
    try {
      if (!this.contracts.LicensingModule) {
        throw new Error('LicensingModule contract not initialized');
      }

      const licenseTemplate = this.contracts.PILicenseTemplate?.address || 
                             process.env.STORY_PIL_LICENSE_TEMPLATE;

      const tx = await this.contracts.LicensingModule.attachLicenseTerms(
        ipId,
        licenseTemplate,
        licenseData
      );
      
      const receipt = await tx.wait();
      logger.info(`License terms attached: ${receipt.transactionHash}`);
      
      return {
        success: true,
        transactionHash: receipt.transactionHash
      };

    } catch (error) {
      logger.error('Failed to attach license terms:', error);
      return { success: false, error: error.message };
    }
  }

  // Create license tokens for an IP asset
  async mintLicenseTokens(ipId, amount, receiver, licenseData) {
    try {
      if (!this.contracts.LicensingModule) {
        throw new Error('LicensingModule contract not initialized');
      }

      const licenseTemplate = this.contracts.PILicenseTemplate?.address || 
                             process.env.STORY_PIL_LICENSE_TEMPLATE;

      const tx = await this.contracts.LicensingModule.mintLicenseTokens(
        ipId,
        licenseTemplate,
        licenseData,
        amount,
        receiver
      );
      
      const receipt = await tx.wait();
      logger.info(`License tokens minted: ${receipt.transactionHash}`);
      
      return {
        success: true,
        transactionHash: receipt.transactionHash
      };

    } catch (error) {
      logger.error('Failed to mint license tokens:', error);
      return { success: false, error: error.message };
    }
  }

  // Pay royalties for an IP asset
  async payRoyalties(receiverIpId, payerIpId, token, amount) {
    try {
      if (!this.contracts.RoyaltyModule) {
        throw new Error('RoyaltyModule contract not initialized');
      }

      const tx = await this.contracts.RoyaltyModule.payRoyaltyOnBehalf(
        receiverIpId,
        payerIpId,
        token,
        amount
      );
      
      const receipt = await tx.wait();
      logger.info(`Royalties paid: ${receipt.transactionHash}`);
      
      return {
        success: true,
        transactionHash: receipt.transactionHash
      };

    } catch (error) {
      logger.error('Failed to pay royalties:', error);
      return { success: false, error: error.message };
    }
  }

  // Get claimable revenue for an IP asset
  async getClaimableRevenue(ipId, asset, user) {
    try {
      if (!this.contracts.RoyaltyModule) {
        throw new Error('RoyaltyModule contract not initialized');
      }

      const revenue = await this.contracts.RoyaltyModule.claimableRevenue(
        ipId,
        asset,
        user
      );
      
      return {
        success: true,
        revenue: ethers.formatEther(revenue)
      };

    } catch (error) {
      logger.error('Failed to get claimable revenue:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if an IP is registered
  async isIPRegistered(chainId, tokenContract, tokenId) {
    try {
      if (!this.contracts.IPAssetRegistry) {
        return { success: false, error: 'IPAssetRegistry not initialized' };
      }

      const ipId = await this.contracts.IPAssetRegistry.ipId(
        chainId,
        tokenContract,
        tokenId
      );
      
      const isRegistered = await this.contracts.IPAssetRegistry.isRegistered(ipId);
      
      return {
        success: true,
        isRegistered,
        ipId
      };

    } catch (error) {
      logger.error('Failed to check IP registration:', error);
      return { success: false, error: error.message };
    }
  }

  // Get network information
  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      const block = await this.provider.getBlockNumber();
      
      return {
        success: true,
        chainId: network.chainId.toString(),
        blockNumber: block,
        networkName: network.name
      };

    } catch (error) {
      logger.error('Failed to get network info:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const storyProtocolService = new StoryProtocolService();

export default storyProtocolService;