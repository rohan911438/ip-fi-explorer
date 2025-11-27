import Navigation from "@/components/Navigation";
import StatsCard from "@/components/StatsCard";
import { mockUserFractions, mockAssets } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Wallet, TrendingUp, PieChart, DollarSign, ArrowUpRight, ArrowDownRight,
  BarChart3, Activity, Target, Award, Calendar, Globe, Filter,
  Eye, Download, RefreshCw, Bell, Settings, Star, TrendingDown,
  Briefcase, Crown, Zap, Shield, ChevronRight, Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "../components/animations.css";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('24h');
  const [activeTab, setActiveTab] = useState('overview');

  // Portfolio calculations
  const totalValue = mockUserFractions.reduce((sum, f) => sum + f.currentValue, 0);
  const totalEarnings = mockUserFractions.reduce((sum, f) => sum + f.projectedMonthlyEarnings, 0);
  const totalFractions = mockUserFractions.reduce((sum, f) => sum + f.fractionsOwned, 0);
  const totalInvested = 875.43; // Mock invested amount
  const profitLoss = totalValue - totalInvested;
  const profitLossPercentage = ((profitLoss / totalInvested) * 100);

  // Market metrics
  const marketMetrics = {
    totalMarketCap: '24.7M ETH',
    totalVolume24h: '2.45M ETH',
    totalAssets: 847,
    activeUsers: 5234,
    avgAPY: 12.4,
    topPerformer: 'Cosmic Dreams Collection',
    marketTrend: 'bullish'
  };

  // Portfolio allocation
  const portfolioAllocation = [
    { type: 'Digital Art', value: 45.2, color: 'bg-blue-500' },
    { type: 'Patents', value: 28.1, color: 'bg-green-500' },
    { type: 'Music Rights', value: 15.7, color: 'bg-purple-500' },
    { type: 'Character IP', value: 11.0, color: 'bg-orange-500' }
  ];

  // Performance data
  const performanceData = [
    { month: 'Jan', value: 650 },
    { month: 'Feb', value: 720 },
    { month: 'Mar', value: 680 },
    { month: 'Apr', value: 790 },
    { month: 'May', value: 850 },
    { month: 'Jun', value: 920 }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading your portfolio...</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Professional Dashboard</h1>
                <p className="text-muted-foreground">Track, analyze, and optimize your IP investment portfolio</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Pro Investor
              </Badge>
              <Badge variant="outline">Portfolio Health: Excellent</Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Invest More
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-blue-500" />
                    </div>
                    <Badge variant="secondary" className="text-green-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{profitLossPercentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totalValue.toFixed(2)} ETH</p>
                    <p className="text-sm text-muted-foreground">Portfolio Value</p>
                    <p className="text-xs text-green-600 mt-1">+{profitLoss.toFixed(2)} ETH profit</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-500" />
                    </div>
                    <Badge variant="secondary" className="text-green-600">Monthly</Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totalEarnings.toFixed(2)} ETH</p>
                    <p className="text-sm text-muted-foreground">Projected Earnings</p>
                    <p className="text-xs text-muted-foreground mt-1">~{marketMetrics.avgAPY}% APY</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <PieChart className="h-6 w-6 text-purple-500" />
                    </div>
                    <Badge variant="secondary">{mockUserFractions.length} Assets</Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totalFractions.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Fractions</p>
                    <p className="text-xs text-muted-foreground mt-1">Diversified portfolio</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Activity className="h-6 w-6 text-orange-500" />
                    </div>
                    <Badge variant="secondary" className="text-orange-600">
                      <Zap className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">High</p>
                    <p className="text-sm text-muted-foreground">Performance Score</p>
                    <p className="text-xs text-muted-foreground mt-1">Top 5% of investors</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Market Overview & Portfolio Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Market Overview */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Market Overview
                  </CardTitle>
                  <Badge variant="outline" className="text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Bullish
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Market Cap</p>
                      <p className="text-2xl font-bold text-foreground">{marketMetrics.totalMarketCap}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">24h Volume</p>
                      <p className="text-2xl font-bold text-foreground">{marketMetrics.totalVolume24h}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Assets</span>
                      <span className="font-medium">{marketMetrics.totalAssets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Users</span>
                      <span className="font-medium">{marketMetrics.activeUsers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg APY</span>
                      <span className="font-medium text-green-600">{marketMetrics.avgAPY}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Top Performer</span>
                      <span className="font-medium truncate">Cosmic Dreams</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Portfolio Allocation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-secondary" />
                    Portfolio Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {portfolioAllocation.map((item, index) => (
                    <div key={item.type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span className="text-sm font-medium">{item.type}</span>
                        </div>
                        <span className="text-sm font-semibold">{item.value}%</span>
                      </div>
                      <Progress value={item.value} className="h-2" />
                    </div>
                  ))}
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Detailed Breakdown
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { action: "Purchased", asset: "Digital Art Collection", amount: "2.5 ETH", time: "2 hours ago", type: "buy" },
                    { action: "Earned", asset: "Patent License #4521", amount: "0.15 ETH", time: "1 day ago", type: "earning" },
                    { action: "Sold", asset: "Music Rights Bundle", amount: "1.8 ETH", time: "2 days ago", type: "sell" },
                    { action: "Earned", asset: "Character IP Universe", amount: "0.22 ETH", time: "3 days ago", type: "earning" }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'buy' ? 'bg-blue-500/10' :
                        activity.type === 'sell' ? 'bg-red-500/10' : 'bg-green-500/10'
                      }`}>
                        {activity.type === 'buy' ? <ArrowDownRight className="h-4 w-4 text-blue-500" /> :
                         activity.type === 'sell' ? <ArrowUpRight className="h-4 w-4 text-red-500" /> :
                         <DollarSign className="h-4 w-4 text-green-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.action} {activity.asset}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${
                          activity.type === 'sell' || activity.type === 'earning' ? 'text-green-600' : 'text-foreground'
                        }`}>
                          {activity.type === 'sell' || activity.type === 'earning' ? '+' : '-'}{activity.amount}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Top Performing Assets */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockAssets.slice(0, 4).map((asset, index) => (
                    <Link key={asset.id} to={`/asset/${asset.id}`}>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group cursor-pointer">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-background">
                          <img src={asset.image} alt={asset.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{asset.title}</p>
                          <p className="text-xs text-muted-foreground">{asset.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600">+{(Math.random() * 20 + 5).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">{asset.totalEarnings} ETH earned</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            {/* Detailed Holdings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold">Your IP Holdings</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Customize
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockUserFractions.map((fraction) => (
                    <Link key={fraction.assetId} to={`/asset/${fraction.assetId}`} className="block group">
                      <Card className="p-4 hover:shadow-md transition-all duration-300 hover:scale-[1.01] border-2 hover:border-primary/20">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-background shrink-0 shadow-sm">
                            <img src={fraction.image} alt={fraction.assetTitle} className="w-full h-full object-cover" />
                          </div>

                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors truncate">
                                {fraction.assetTitle}
                              </h3>
                              <Badge variant="secondary" className="shrink-0">
                                <Star className="h-3 w-3 mr-1" />
                                Premium
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Fractions Owned</p>
                                <p className="font-semibold">{fraction.fractionsOwned.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Ownership</p>
                                <p className="font-semibold">{((fraction.fractionsOwned / fraction.totalSupply) * 100).toFixed(2)}%</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Current Value</p>
                                <p className="font-semibold text-green-600">{fraction.currentValue.toFixed(2)} ETH</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Monthly Earnings</p>
                                <p className="font-semibold text-blue-600">+{fraction.projectedMonthlyEarnings.toFixed(2)} ETH</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <Progress 
                                value={((fraction.fractionsOwned / fraction.totalSupply) * 100)} 
                                className="w-32 h-2"
                              />
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-green-600">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  +12.5%
                                </Badge>
                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Interactive chart would go here</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>ROI Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total ROI</span>
                      <span className="font-bold text-green-600">+{profitLossPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Best Performer</span>
                      <span className="font-bold">Cosmic Dreams (+45%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Avg Monthly Return</span>
                      <span className="font-bold text-blue-600">{marketMetrics.avgAPY}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Investment Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                    <p className="font-medium text-blue-900 dark:text-blue-100">Diversification Opportunity</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Consider investing in music rights to balance your portfolio</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                    <p className="font-medium text-green-900 dark:text-green-100">High-Yield Asset</p>
                    <p className="text-sm text-green-700 dark:text-green-300">Patent #5521 shows 18% monthly growth potential</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Portfolio Risk Level</span>
                      <Badge variant="secondary" className="text-green-600">Low</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Diversification Score</span>
                      <span className="font-bold">8.5/10</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Volatility</span>
                      <span className="font-bold text-green-600">Low</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
