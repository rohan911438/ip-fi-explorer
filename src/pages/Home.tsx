import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/contexts/WalletContext";
import { 
  Wallet, Shield, TrendingUp, Users, Package, DollarSign, 
  Zap, Globe, ArrowRight, Play, CheckCircle, Star, 
  BarChart3, PieChart, TrendingDown, Lock, Coins, 
  Network, Lightbulb, Target, Rocket, Award 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/hero-bg";
import { useEffect, useState } from "react";
import "../components/animations.css";

const Home = () => {
  const { connectWallet, isConnecting } = useWallet();
  const [currentStat, setCurrentStat] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const stats = [
    { label: "Total Assets", value: "847", icon: Package, color: "text-blue-500" },
    { label: "Total Volume", value: "2,450 ETH", icon: TrendingUp, color: "text-green-500" },
    { label: "Active Users", value: "5,234", icon: Users, color: "text-purple-500" },
    { label: "Royalties Paid", value: "156 ETH", icon: DollarSign, color: "text-orange-500" }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-4 left-1/2 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className={`flex items-center gap-2 transition-all duration-700 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-spin-slow hover:animate-spin transition-all">
                <span className="text-primary-foreground font-bold text-sm">IP</span>
              </div>
              <span className="font-bold text-xl text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                IP-Fi Swap
              </span>
            </div>
            
            <div className={`transition-all duration-700 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <Button 
                onClick={connectWallet} 
                disabled={isConnecting}
                className="flex items-center gap-2 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Wallet className="h-4 w-4 relative z-10 group-hover:animate-pulse" />
                <span className="relative z-10">
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-background/95" />
        </div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <div className="space-y-2">
                <Badge 
                  variant="secondary" 
                  className="px-4 py-2 text-sm font-medium animate-bounce"
                  style={{ animationDelay: '0.5s' }}
                >
                  🚀 Powered by Story Protocol
                </Badge>
                <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
                  <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-pulse">
                    Fractional IP
                  </span>
                  <br />
                  <span className="text-foreground">
                    Ownership
                  </span>
                  <br />
                  <span className="text-sm md:text-xl font-normal text-muted-foreground">
                    for Everyone 🌟
                  </span>
                </h1>
              </div>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                Transform intellectual property into <span className="text-primary font-semibold">tradeable digital assets</span>. 
                Invest in patents, copyrights, and creative works while earning <span className="text-green-500 font-semibold">passive royalties</span> 
                through our revolutionary blockchain platform.
              </p>

              {/* Animated Stats */}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <Card 
                    key={stat.label} 
                    className={`p-4 border-l-4 transition-all duration-500 hover:scale-105 cursor-pointer ${
                      currentStat === index 
                        ? 'border-l-primary bg-primary/5 shadow-lg transform scale-105' 
                        : 'border-l-muted hover:border-l-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <stat.icon className={`h-6 w-6 ${currentStat === index ? stat.color : 'text-muted-foreground'}`} />
                      <div>
                        <div className={`text-2xl font-bold ${currentStat === index ? 'text-primary' : 'text-foreground'}`}>
                          {stat.value}
                        </div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={connectWallet} 
                  disabled={isConnecting}
                  className="flex items-center gap-2 text-lg px-8 py-4 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Wallet className="h-5 w-5 relative z-10 group-hover:animate-pulse" />
                  <span className="relative z-10">
                    {isConnecting ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Connecting...
                      </span>
                    ) : (
                      'Connect Wallet to Start'
                    )}
                  </span>
                  <ArrowRight className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-4 group hover:bg-secondary/10 transition-all duration-300"
                >
                  <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Right Visual */}
            <div className={`relative transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`} style={{ animationDelay: '0.3s' }}>
              <div className="relative">
                {/* Floating Cards Animation */}
                <div className="absolute inset-0 animate-float">
                  <Card className="absolute top-0 right-0 w-48 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm border-primary/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">Patent #2024</span>
                      </div>
                      <div className="text-xs text-muted-foreground">AI Algorithm</div>
                      <div className="text-lg font-bold text-primary">$125,000</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="absolute inset-0 animate-float-delayed">
                  <Card className="absolute bottom-0 left-0 w-48 h-32 bg-gradient-to-br from-secondary/20 to-accent/20 backdrop-blur-sm border-secondary/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-5 w-5 text-secondary" />
                        <span className="text-sm font-medium">Copyright</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Digital Art</div>
                      <div className="text-lg font-bold text-secondary">$45,000</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="absolute inset-0 animate-pulse-slow">
                  <Card className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-40 bg-gradient-to-br from-accent/20 to-primary/20 backdrop-blur-sm border-accent/30">
                    <CardContent className="p-6 text-center">
                      <div className="flex justify-center mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-spin-slow">
                          <Network className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="text-sm font-medium mb-1">Story Protocol</div>
                      <div className="text-xs text-muted-foreground">Decentralized IP</div>
                      <div className="text-2xl font-bold text-primary mt-2">∞</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Connection Lines */}
                <svg className="absolute inset-0 w-full h-full animate-pulse" style={{ animationDelay: '1s' }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  <line x1="20%" y1="30%" x2="50%" y2="50%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5,5" className="animate-dash" />
                  <line x1="80%" y1="70%" x2="50%" y2="50%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5,5" className="animate-dash" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Concept Section */}
      <section className="py-24 bg-muted/30 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="px-6 py-2 mb-4 animate-bounce">
              🧠 Our Core Innovation
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Democratizing <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Intellectual Property</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              We're revolutionizing how intellectual property is owned, traded, and monetized by breaking down 
              traditional barriers and making IP accessible to everyone through blockchain technology.
            </p>
          </div>

          {/* Process Flow */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            {[
              {
                step: "01",
                title: "IP Discovery",
                description: "Discover valuable intellectual property assets from patents to creative works",
                icon: Target,
                color: "from-blue-500 to-cyan-500"
              },
              {
                step: "02", 
                title: "Fractionalization",
                description: "Break IP assets into affordable fractions using smart contracts",
                icon: PieChart,
                color: "from-purple-500 to-pink-500"
              },
              {
                step: "03",
                title: "Investment",
                description: "Purchase fractions with cryptocurrency and become a co-owner",
                icon: Coins,
                color: "from-green-500 to-emerald-500"
              },
              {
                step: "04",
                title: "Earn Royalties",
                description: "Receive passive income from your IP investments automatically",
                icon: TrendingUp,
                color: "from-orange-500 to-red-500"
              }
            ].map((item, index) => (
              <Card 
                key={item.step} 
                className={`relative group hover:scale-105 transition-all duration-500 cursor-pointer border-2 hover:shadow-2xl ${
                  isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-10'
                }`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-8 text-center">
                  <div className="relative mb-6">
                    <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:animate-pulse`}>
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </CardContent>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-primary animate-pulse" />
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Value Propositions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 hover:scale-105 transition-all duration-500">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">For Investors</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Access high-value intellectual property investments with as little as $10. 
                  Diversify your portfolio with income-generating IP assets.
                </p>
                <ul className="space-y-2">
                  {["Low minimum investment", "Passive royalty income", "Portfolio diversification", "Liquid IP trading"].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-secondary/5 to-accent/5 border-secondary/20 hover:scale-105 transition-all duration-500">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Lightbulb className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-2xl font-bold">For Creators</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Monetize your intellectual property instantly while retaining ownership. 
                  Get funding for new projects without giving up control.
                </p>
                <ul className="space-y-2">
                  {["Instant IP monetization", "Retain ownership control", "Global market access", "Transparent revenue sharing"].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20 hover:scale-105 transition-all duration-500">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Network className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold">For Everyone</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Democratize access to intellectual property markets. Make IP ownership 
                  accessible, transparent, and profitable for all participants.
                </p>
                <ul className="space-y-2">
                  {["Blockchain transparency", "Decentralized governance", "Global accessibility", "Fair value discovery"].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="px-6 py-2 mb-4">
            ⚡ Powerful Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Why Choose <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">IP-Fi Swap</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect your wallet to access cutting-edge tools for fractional IP ownership, 
            trading, and monetization in the decentralized creator economy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Package,
              title: "Diverse IP Portfolio",
              description: "Access patents, copyrights, trademarks, and creative works across multiple industries",
              features: ["Tech Patents", "Digital Art", "Music Rights", "Brand Assets"],
              gradient: "from-blue-500 to-cyan-500",
              delay: "0s"
            },
            {
              icon: PieChart,
              title: "Fractional Ownership",
              description: "Own portions of high-value IP assets with smart contract-powered fractionalization",
              features: ["Smart Contracts", "Automated Trading", "Instant Settlement", "Low Minimums"],
              gradient: "from-purple-500 to-pink-500",
              delay: "0.1s"
            },
            {
              icon: DollarSign,
              title: "Passive Royalties",
              description: "Earn continuous income from IP usage and licensing automatically",
              features: ["Monthly Payouts", "Compound Returns", "Global Revenue", "Transparent Tracking"],
              gradient: "from-green-500 to-emerald-500",
              delay: "0.2s"
            },
            {
              icon: Shield,
              title: "Blockchain Security",
              description: "Built on Story Protocol with enterprise-grade security and transparency",
              features: ["Immutable Records", "Audit Trails", "Secure Custody", "DeFi Integration"],
              gradient: "from-orange-500 to-red-500",
              delay: "0.3s"
            },
            {
              icon: Network,
              title: "Global Marketplace",
              description: "Connect with creators and investors worldwide in our decentralized ecosystem",
              features: ["24/7 Trading", "Cross-border", "Multi-currency", "Social Features"],
              gradient: "from-indigo-500 to-purple-500",
              delay: "0.4s"
            },
            {
              icon: Zap,
              title: "Instant Liquidity",
              description: "Trade IP fractions instantly with our advanced AMM and order book system",
              features: ["Instant Swaps", "Price Discovery", "Deep Liquidity", "MEV Protection"],
              gradient: "from-yellow-500 to-orange-500",
              delay: "0.5s"
            }
          ].map((feature, index) => (
            <Card 
              key={feature.title}
              className={`group relative overflow-hidden border-2 hover:border-primary/50 hover:shadow-2xl transition-all duration-500 hover:scale-105 ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-10'
              }`}
              style={{ animationDelay: feature.delay }}
            >
              {/* Animated Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} bg-opacity-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-7 w-7 text-primary group-hover:animate-pulse" />
                  </div>
                  <Badge variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Star className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                </div>
                
                <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
                
                {/* Feature List */}
                <div className="pt-4 space-y-2">
                  {feature.features.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ transitionDelay: `${i * 0.1}s` }}>
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.gradient}`}></div>
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
                
                {/* Hover Action */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary/10"
                >
                  Learn More
                  <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "$2.4M+", label: "Total Volume Traded", icon: TrendingUp, growth: "+124%" },
              { value: "847", label: "IP Assets Listed", icon: Package, growth: "+67%" },
              { value: "5,234", label: "Active Investors", icon: Users, growth: "+89%" },
              { value: "156 ETH", label: "Royalties Distributed", icon: Coins, growth: "+156%" }
            ].map((stat, index) => (
              <Card key={stat.label} className="text-center p-6 hover:scale-105 transition-all duration-500 border-2 hover:border-primary/30">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse">
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-muted-foreground mb-2">{stat.label}</div>
                <Badge variant="secondary" className="text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.growth}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-24 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_hsl(var(--background))_100%)]"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <Badge variant="outline" className="px-6 py-2 mb-6 text-lg animate-pulse">
              🚀 Join the IP Revolution
            </Badge>
            
            <h2 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
              Ready to <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Transform</span>
              <br />Your Portfolio?
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed">
              Join thousands of investors already earning passive income from intellectual property. 
              Connect your MetaMask wallet and start your journey into the future of IP ownership.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                size="lg" 
                onClick={connectWallet} 
                disabled={isConnecting}
                className="group relative overflow-hidden bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-lg px-10 py-6 rounded-xl shadow-2xl hover:shadow-primary/25 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {isConnecting ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Connecting to Wallet...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 relative z-10">
                    <Wallet className="h-6 w-6 group-hover:animate-pulse" />
                    <span>Connect Wallet & Start Investing</span>
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
              
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">Instant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-purple-500" />
                  <span className="text-sm">Decentralized</span>
                </div>
              </div>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-white font-bold text-xs">SP</span>
                </div>
                <span className="text-sm">Story Protocol</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">MM</span>
                </div>
                <span className="text-sm">MetaMask</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">ETH</span>
                </div>
                <span className="text-sm">Ethereum</span>
              </div>
            </div>
          </div>
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