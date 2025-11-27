import Navigation from "@/components/Navigation";
import StatsCard from "@/components/StatsCard";
import { mockUserFractions } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, PieChart, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const totalValue = mockUserFractions.reduce((sum, f) => sum + f.currentValue, 0);
  const totalEarnings = mockUserFractions.reduce(
    (sum, f) => sum + f.projectedMonthlyEarnings,
    0
  );
  const totalFractions = mockUserFractions.reduce((sum, f) => sum + f.fractionsOwned, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Dashboard</h1>
          <p className="text-muted-foreground">
            Track your IP fractions and projected earnings
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Portfolio Value"
            value={`${totalValue.toFixed(2)} ETH`}
            icon={Wallet}
          />
          <StatsCard
            title="Total Fractions"
            value={totalFractions.toLocaleString()}
            icon={PieChart}
          />
          <StatsCard
            title="Assets Owned"
            value={mockUserFractions.length}
            icon={TrendingUp}
          />
          <StatsCard
            title="Monthly Earnings"
            value={`${totalEarnings.toFixed(2)} ETH`}
            icon={DollarSign}
            trend="Projected"
          />
        </div>

        {/* Holdings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Fractions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockUserFractions.map((fraction) => (
                <Link
                  key={fraction.assetId}
                  to={`/asset/${fraction.assetId}`}
                  className="block"
                >
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted hover:bg-muted/70 transition-colors">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-background shrink-0">
                      <img
                        src={fraction.image}
                        alt={fraction.assetTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1 truncate">
                        {fraction.assetTitle}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">
                          {fraction.fractionsOwned.toLocaleString()} fractions
                        </Badge>
                        <Badge variant="secondary">
                          {((fraction.fractionsOwned / fraction.totalSupply) * 100).toFixed(
                            2
                          )}
                          % ownership
                        </Badge>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm text-muted-foreground mb-1">Current Value</p>
                      <p className="font-semibold text-foreground">
                        {fraction.currentValue.toFixed(2)} ETH
                      </p>
                      <p className="text-xs text-secondary mt-1">
                        +{fraction.projectedMonthlyEarnings.toFixed(2)} ETH/mo
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
