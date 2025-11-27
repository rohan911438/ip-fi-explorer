import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/contexts/WalletContext";
import { Wallet, Shield, TrendingUp, Users, Package, DollarSign } from "lucide-react";
import heroImage from "@/assets/hero-bg";

const Home = () => {
  const { connectWallet, isConnecting } = useWallet();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">IP</span>
              </div>
              <span className="font-bold text-xl text-foreground">IP-Fi Swap</span>
            </div>
            
            <Button 
              onClick={connectWallet} 
              disabled={isConnecting}
              className="flex items-center gap-2"
            >
              <Wallet className="h-4 w-4" />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />
        </div>
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Fractional IP Ownership for Everyone
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Invest in intellectual property assets, earn royalties, and participate in the creator economy through Story Protocol.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={connectWallet} 
                disabled={isConnecting}
                className="flex items-center gap-2 text-lg px-8 py-3"
              >
                <Wallet className="h-5 w-5" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet to Start'}
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose IP-Fi Swap?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect your wallet to access powerful tools for fractional IP ownership and trading
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-border">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Diverse IP Assets</CardTitle>
              <CardDescription>
                Access a wide range of intellectual property assets from patents to creative works
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Fractional Ownership</CardTitle>
              <CardDescription>
                Own fractions of high-value IP assets and trade them seamlessly on our platform
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Earn Royalties</CardTitle>
              <CardDescription>
                Generate passive income through royalties from your IP asset investments
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Secure & Transparent</CardTitle>
              <CardDescription>
                Built on blockchain technology ensuring security and transparency in all transactions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Community Driven</CardTitle>
              <CardDescription>
                Join a growing community of IP investors and creators shaping the future
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Easy Integration</CardTitle>
              <CardDescription>
                Connect with MetaMask and other popular wallets to start trading immediately
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect your MetaMask wallet to explore, invest in, and trade fractional IP assets
          </p>
          <Button 
            size="lg" 
            onClick={connectWallet} 
            disabled={isConnecting}
            className="flex items-center gap-2 text-lg px-8 py-3 mx-auto"
          >
            <Wallet className="h-5 w-5" />
            {isConnecting ? 'Connecting...' : 'Connect Wallet Now'}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 IP-Fi Swap. Powered by Story Protocol.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;