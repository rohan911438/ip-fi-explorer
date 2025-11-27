import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IPAsset } from "@/lib/mockData";
import { TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface AssetCardProps {
  asset: IPAsset;
}

const AssetCard = ({ asset }: AssetCardProps) => {
  const availabilityPercentage = (asset.availableFractions / asset.totalSupply) * 100;

  return (
    <Link to={`/asset/${asset.id}`}>
      <Card className="overflow-hidden hover:shadow-[var(--shadow-card-hover)] transition-[box-shadow] duration-300 cursor-pointer group">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={asset.image}
            alt={asset.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg text-foreground line-clamp-1">
              {asset.title}
            </h3>
            <Badge variant="secondary" className="ml-2 shrink-0">
              {asset.type}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            by {asset.creator}
          </p>
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-muted-foreground">Price/Fraction</p>
              <p className="font-semibold text-foreground">{asset.pricePerFraction} ETH</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Available</p>
              <p className="font-semibold text-foreground">
                {availabilityPercentage.toFixed(0)}%
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4 text-secondary" />
          <span>{asset.totalEarnings} ETH earned</span>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default AssetCard;
