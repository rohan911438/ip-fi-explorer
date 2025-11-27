import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Widget = () => {
  const [fractions, setFractions] = useState(100);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const pricePerFraction = 0.05;
  const royaltyRate = 10;
  const totalCost = fractions * pricePerFraction;
  const estimatedReturn = (totalCost * (royaltyRate / 100)) / 12;

  const embedCode = `<iframe src="${window.location.origin}/widget" width="400" height="600" frameborder="0"></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast({
      title: "Copied to clipboard!",
      description: "Embed code has been copied.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Embeddable Widget
            </h1>
            <p className="text-muted-foreground">
              Add the fraction calculator to your website or app
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Preview */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Preview</h2>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-center">IP Fraction Calculator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="widget-fractions">Number of Fractions</Label>
                    <Input
                      id="widget-fractions"
                      type="number"
                      value={fractions}
                      onChange={(e) => setFractions(Number(e.target.value))}
                      min={1}
                    />
                  </div>

                  <div className="space-y-4 p-4 rounded-lg bg-muted">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Price per Fraction
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {pricePerFraction} ETH
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Cost</span>
                      <span className="font-semibold text-foreground">
                        {totalCost.toFixed(4)} ETH
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Est. Monthly Return
                      </span>
                      <span className="font-semibold text-secondary">
                        ~{estimatedReturn.toFixed(4)} ETH
                      </span>
                    </div>
                  </div>

                  <Button className="w-full" size="lg">
                    Calculate
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Powered by IP-Fi Swap
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Embed Code */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Embed Code
              </h2>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label htmlFor="embed-code">Copy this code to your website</Label>
                    <div className="relative mt-2">
                      <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto">
                        <code className="text-foreground">{embedCode}</code>
                      </pre>
                      <Button
                        size="icon"
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">
                      Customization Options
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Adjust width and height to fit your layout</li>
                      <li>• Widget is fully responsive</li>
                      <li>• Supports light and dark themes</li>
                      <li>• No dependencies required</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      The widget is open source and free to use. It automatically
                      connects to Story Protocol for real-time data.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Widget;
