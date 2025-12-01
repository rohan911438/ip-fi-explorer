import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface WalletContextType {
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  provider: ethers.BrowserProvider | null;
  chainId: string | null;
  switchToStoryNetwork: () => Promise<void>;
  isStoryNetwork: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);

  const isConnected = !!account;
  const isStoryNetwork = chainId === '1513'; // Story testnet chain ID

  // Story Protocol testnet configuration
  const STORY_NETWORK = {
    chainId: '0x5E9', // 1513 in hex
    chainName: 'Story Testnet',
    nativeCurrency: {
      name: 'Story',
      symbol: 'STORY',
      decimals: 18
    },
    rpcUrls: ['https://rpc-story-testnet.rockx.com'],
    blockExplorerUrls: ['https://story-testnet.blockscout.com']
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setProvider(provider);
      setAccount(address);
      
      // Get current chain ID
      const network = await provider.getNetwork();
      setChainId(network.chainId.toString());
      
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAccount', address);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToStoryNetwork = async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed.');
      return;
    }

    try {
      // Try to switch to Story network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: STORY_NETWORK.chainId }],
      });
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [STORY_NETWORK],
          });
        } catch (addError) {
          console.error('Failed to add Story network:', addError);
          throw addError;
        }
      } else {
        console.error('Failed to switch to Story network:', switchError);
        throw switchError;
      }
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setChainId(null);
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAccount');
  };

  // Check for existing connection on load
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum && localStorage.getItem('walletConnected') === 'true') {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            const network = await provider.getNetwork();
            setProvider(provider);
            setAccount(accounts[0].address);
            setChainId(network.chainId.toString());
          }
        } catch (error) {
          console.error('Failed to check wallet connection:', error);
          localStorage.removeItem('walletConnected');
          localStorage.removeItem('walletAccount');
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
          localStorage.setItem('walletAccount', accounts[0]);
        }
      };

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        account,
        isConnected,
        isConnecting,
        connectWallet,
        disconnectWallet,
        provider,
        chainId,
        switchToStoryNetwork,
        isStoryNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};