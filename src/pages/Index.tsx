import Navigation from "@/components/Navigation";
import AssetCard from "@/components/AssetCard";
import StatsCard from "@/components/StatsCard";
import { mockAssets } from "@/lib/mockData";
import { TrendingUp, Package, Users, DollarSign } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
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
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Fractional IP Ownership for Everyone
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Invest in intellectual property assets, earn royalties, and participate in the creator economy through Story Protocol.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Assets"
            value="847"
            icon={Package}
            trend="+12% this month"
          />
          <StatsCard
            title="Total Volume"
            value="2,450 ETH"
            icon={TrendingUp}
            trend="+24% this month"
          />
          <StatsCard
            title="Active Users"
            value="5,234"
            icon={Users}
            trend="+8% this month"
          />
          <StatsCard
            title="Royalties Paid"
            value="156 ETH"
            icon={DollarSign}
            trend="+18% this month"
          />
        </div>
      </section>

      {/* Featured Assets */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Featured IP Assets</h2>
          <p className="text-muted-foreground">Discover and invest in high-quality intellectual property</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
