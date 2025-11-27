import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

interface FractionCalculatorProps {
  pricePerFraction: number;
  availableFractions: number;
  royaltyRate: number;
}

const FractionCalculator = ({
  pricePerFraction,
  availableFractions,
  royaltyRate,
}: FractionCalculatorProps) => {
  const [fractions, setFractions] = useState<number>(100);

  const totalCost = fractions * pricePerFraction;
  const estimatedMonthlyReturn = (totalCost * (royaltyRate / 100)) / 12;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Fraction Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fractions">Number of Fractions</Label>
          <Input
            id="fractions"
            type="number"
            value={fractions}
            onChange={(e) => setFractions(Math.min(Number(e.target.value), availableFractions))}
            max={availableFractions}
            min={1}
          />
          <p className="text-sm text-muted-foreground">
            Max available: {availableFractions.toLocaleString()}
          </p>
        </div>

        <div className="space-y-4 p-4 rounded-lg bg-muted">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Cost</span>
            <span className="font-semibold text-foreground">{totalCost.toFixed(4)} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ownership Share</span>
            <span className="font-semibold text-foreground">
              {((fractions / (availableFractions + fractions)) * 100).toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Est. Monthly Return</span>
            <span className="font-semibold text-secondary">
              ~{estimatedMonthlyReturn.toFixed(4)} ETH
            </span>
          </div>
        </div>

        <Button className="w-full" size="lg">
          Purchase Fractions
        </Button>
      </CardContent>
    </Card>
  );
};

export default FractionCalculator;
