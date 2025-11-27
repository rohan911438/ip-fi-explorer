import { useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import FractionCalculator from "@/components/FractionCalculator";
import { mockAssets } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, FileText, GitBranch, Tag } from "lucide-react";
import { Link } from "react-router-dom";

const AssetDetail = () => {
  const { id } = useParams();
  const asset = mockAssets.find((a) => a.id === id);

  if (!asset) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground">Asset not found</h1>
          <Link to="/" className="text-primary hover:underline mt-4 inline-block">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image and Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video lg:aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={asset.image}
                alt={asset.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {asset.title}
                  </h1>
                  <p className="text-muted-foreground">Created by {asset.creator}</p>
                </div>
                <Badge variant="secondary" className="text-base">
                  {asset.type}
                </Badge>
              </div>

              <Separator className="my-6" />

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Created:</span>
                    <span className="text-foreground font-medium">{asset.metadata.created}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">License:</span>
                    <span className="text-foreground font-medium">{asset.metadata.license}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">Tags:</span>
                    <div className="flex flex-wrap gap-2">
                      {asset.metadata.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Derivatives */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-primary" />
                    Derivatives ({asset.derivatives.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {asset.derivatives.map((derivative) => (
                      <div
                        key={derivative.id}
                        className="p-3 rounded-lg bg-muted hover:bg-muted/70 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">{derivative.title}</p>
                            <p className="text-sm text-muted-foreground">by {derivative.creator}</p>
                          </div>
                          <Badge variant="outline">{derivative.type}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Calculator and Stats */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Supply</p>
                  <p className="text-2xl font-bold text-foreground">
                    {asset.totalSupply.toLocaleString()}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Available Fractions</p>
                  <p className="text-2xl font-bold text-foreground">
                    {asset.availableFractions.toLocaleString()}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Royalty Rate</p>
                  <p className="text-2xl font-bold text-secondary">{asset.royaltyRate}%</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-foreground">{asset.totalEarnings} ETH</p>
                </div>
              </CardContent>
            </Card>

            <FractionCalculator
              pricePerFraction={asset.pricePerFraction}
              availableFractions={asset.availableFractions}
              royaltyRate={asset.royaltyRate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;
