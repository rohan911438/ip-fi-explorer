import { ethers } from 'ethers';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface StoryProtocolConfig {
  contracts: {
    IPAssetRegistry: string;
    LicensingModule: string;
    RoyaltyModule: string;
    LicenseRegistry: string;
    LicenseToken: string;
    PILicenseTemplate: string;
    GroupingModule: string;
    DisputeModule: string;
    CoreMetadataModule: string;
  };
  network: {
    name: string;
    chainId: string;
    rpc: string;
  };
}

export interface IPRegistrationResult {
  success: boolean;
  transactionHash?: string;
  ipId?: string;
  error?: string;
}

export interface NetworkInfo {
  success: boolean;
  chainId?: string;
  blockNumber?: number;
  networkName?: string;
  error?: string;
}

class StoryProtocolService {
  private config: StoryProtocolConfig | null = null;

  async initialize(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/story-protocol/contracts`);
      const data = await response.json();
      
      if (data.success) {
        this.config = data;
      } else {
        throw new Error(data.message || 'Failed to initialize Story Protocol service');
      }
    } catch (error) {
      console.error('Failed to initialize Story Protocol service:', error);
      throw error;
    }
  }

  async getNetworkInfo(): Promise<NetworkInfo> {
    try {
      const response = await fetch(`${API_BASE_URL}/story-protocol/network-info`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get network info:', error);
      return { success: false, error: 'Network request failed' };
    }
  }

  async registerIPAsset(tokenContract: string, tokenId: number, authToken?: string): Promise<IPRegistrationResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/story-protocol/register-ip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({ tokenContract, tokenId })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to register IP asset:', error);
      return { success: false, error: 'Network request failed' };
    }
  }

  async checkIPRegistration(chainId: number, tokenContract: string, tokenId: number): Promise<any> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/story-protocol/check-ip/${chainId}/${tokenContract}/${tokenId}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to check IP registration:', error);
      return { success: false, error: 'Network request failed' };
    }
  }

  async attachLicenseTerms(ipId: string, licenseData: string, authToken?: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/story-protocol/attach-license`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({ ipId, licenseData })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to attach license terms:', error);
      return { success: false, error: 'Network request failed' };
    }
  }

  async mintLicenseTokens(
    ipId: string, 
    amount: number, 
    receiver: string, 
    licenseData?: string,
    authToken?: string
  ): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/story-protocol/mint-license-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({ ipId, amount, receiver, licenseData })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to mint license tokens:', error);
      return { success: false, error: 'Network request failed' };
    }
  }

  async payRoyalties(
    receiverIpId: string,
    payerIpId: string,
    token: string,
    amount: string,
    authToken?: string
  ): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/story-protocol/pay-royalties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({ receiverIpId, payerIpId, token, amount })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to pay royalties:', error);
      return { success: false, error: 'Network request failed' };
    }
  }

  async getClaimableRevenue(ipId: string, asset: string, user: string, authToken?: string): Promise<any> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/story-protocol/claimable-revenue/${ipId}/${asset}/${user}`,
        {
          headers: {
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
          }
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get claimable revenue:', error);
      return { success: false, error: 'Network request failed' };
    }
  }

  getConfig(): StoryProtocolConfig | null {
    return this.config;
  }

  getContractAddress(contractName: keyof StoryProtocolConfig['contracts']): string | undefined {
    return this.config?.contracts[contractName];
  }

  // Helper function to create contract instance for direct frontend interaction
  createContract(contractName: keyof StoryProtocolConfig['contracts'], provider: ethers.Provider): ethers.Contract | null {
    const address = this.getContractAddress(contractName);
    if (!address) return null;

    // Basic ABI for common functions
    const basicABI = [
      "function totalSupply() external view returns (uint256)",
      "function balanceOf(address owner) external view returns (uint256)",
      "function tokenURI(uint256 tokenId) external view returns (string memory)"
    ];

    return new ethers.Contract(address, basicABI, provider);
  }
}

// Create singleton instance
const storyProtocolService = new StoryProtocolService();

export default storyProtocolService;