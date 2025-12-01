import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWallet } from "@/contexts/WalletContext";
import storyProtocolService, { NetworkInfo, IPRegistrationResult } from "@/services/storyProtocol";
import { 
  Network, 
  FileText, 
  Shield, 
  Coins, 
  CheckCircle, 
  AlertCircle,
  ExternalLink 
} from "lucide-react";

const StoryProtocolDashboard: React.FC = () => {
  const { isConnected, isStoryNetwork, switchToStoryNetwork, account } = useWallet();
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // IP Registration form
  const [tokenContract, setTokenContract] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [registrationResult, setRegistrationResult] = useState<IPRegistrationResult | null>(null);

  useEffect(() => {
    initializeStoryProtocol();
  }, []);

  const initializeStoryProtocol = async () => {
    try {
      setLoading(true);
      await storyProtocolService.initialize();
      const info = await storyProtocolService.getNetworkInfo();
      setNetworkInfo(info);
    } catch (err) {
      setError('Failed to initialize Story Protocol service');
      console.error('Initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterIP = async () => {
    if (!tokenContract || !tokenId) {
      setError('Please provide both token contract address and token ID');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await storyProtocolService.registerIPAsset(
        tokenContract,
        parseInt(tokenId)
      );
      
      setRegistrationResult(result);
      
      if (result.success) {
        setSuccess('IP Asset registered successfully!');
        setTokenContract('');
        setTokenId('');
      } else {
        setError(result.error || 'Failed to register IP asset');
      }
    } catch (err) {
      setError('Registration failed: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Story Protocol Integration
          </CardTitle>
          <CardDescription>
            Connect your wallet to interact with Story Protocol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to access Story Protocol features.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!isStoryNetwork) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Story Protocol Integration
          </CardTitle>
          <CardDescription>
            Switch to Story Protocol testnet to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Network className="h-4 w-4" />
            <AlertDescription>
              You need to switch to Story Protocol testnet (Chain ID: 1513) to use these features.
            </AlertDescription>
          </Alert>
          <Button onClick={switchToStoryNetwork} className="w-full">
            <Network className="h-4 w-4 mr-2" />
            Switch to Story Testnet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Network Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Story Protocol Network Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !networkInfo ? (
            <div>Loading network information...</div>
          ) : networkInfo?.success ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Chain ID</Label>
                <div className="mt-1">
                  <Badge variant="default">{networkInfo.chainId}</Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Current Block</Label>
                <div className="mt-1">
                  <Badge variant="outline">{networkInfo.blockNumber}</Badge>
                </div>
              </div>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to connect to Story Protocol network
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* IP Asset Registration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Register IP Asset
          </CardTitle>
          <CardDescription>
            Register your NFT as an IP Asset on Story Protocol
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tokenContract">Token Contract Address</Label>
              <Input
                id="tokenContract"
                value={tokenContract}
                onChange={(e) => setTokenContract(e.target.value)}
                placeholder="0x..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tokenId">Token ID</Label>
              <Input
                id="tokenId"
                type="number"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="1"
                className="mt-1"
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {registrationResult?.success && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Registration Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-xs">IP ID:</Label>
                  <div className="font-mono text-sm break-all">
                    {registrationResult.ipId}
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Transaction Hash:</Label>
                  <div className="font-mono text-sm break-all flex items-center gap-2">
                    {registrationResult.transactionHash}
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Button 
            onClick={handleRegisterIP} 
            disabled={loading || !tokenContract || !tokenId}
            className="w-full"
          >
            {loading ? 'Registering...' : 'Register IP Asset'}
          </Button>
        </CardContent>
      </Card>

      {/* Story Protocol Features */}
      <Card>
        <CardHeader>
          <CardTitle>Story Protocol Features</CardTitle>
          <CardDescription>
            Available features for IP management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <FileText className="h-8 w-8 mb-2 text-blue-500" />
              <h3 className="font-medium">IP Registration</h3>
              <p className="text-sm text-muted-foreground">
                Register your NFTs as IP assets
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <Shield className="h-8 w-8 mb-2 text-green-500" />
              <h3 className="font-medium">Licensing</h3>
              <p className="text-sm text-muted-foreground">
                Create and manage IP licenses
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <Coins className="h-8 w-8 mb-2 text-yellow-500" />
              <h3 className="font-medium">Royalties</h3>
              <p className="text-sm text-muted-foreground">
                Distribute and claim royalties
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoryProtocolDashboard;