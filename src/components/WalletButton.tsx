import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { Wallet, LogOut, Network } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const WalletButton = () => {
  const { 
    account, 
    isConnected, 
    isConnecting, 
    connectWallet, 
    disconnectWallet,
    isStoryNetwork,
    switchToStoryNetwork,
    chainId 
  } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <Button 
        onClick={connectWallet} 
        disabled={isConnecting}
        className="flex items-center gap-2"
      >
        <Wallet className="h-4 w-4" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isConnected && !isStoryNetwork && (
        <Badge variant="destructive" className="text-xs">
          Wrong Network
        </Badge>
      )}
      {isConnected && isStoryNetwork && (
        <Badge variant="default" className="text-xs">
          Story Testnet
        </Badge>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            {formatAddress(account!)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            Chain ID: {chainId || 'Unknown'}
          </div>
          <DropdownMenuSeparator />
          
          {!isStoryNetwork && (
            <DropdownMenuItem 
              onClick={switchToStoryNetwork}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Network className="h-4 w-4" />
              Switch to Story Testnet
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem 
            onClick={disconnectWallet}
            className="flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default WalletButton;