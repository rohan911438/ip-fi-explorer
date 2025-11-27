import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Fractionalize = () => {
  const [step, setStep] = useState(1);
  const [supply, setSupply] = useState("10000");
  const [royalty, setRoyalty] = useState("10");
  const { toast } = useToast();

  const steps = [
    { number: 1, title: "Set Supply" },
    { number: 2, title: "Royalty Split" },
    { number: 3, title: "Preview" },
  ];

  const handleComplete = () => {
    toast({
      title: "Fractionalization Complete!",
      description: "Your IP asset has been fractionalized successfully.",
    });
    setStep(1);
    setSupply("10000");
    setRoyalty("10");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Fractionalize IP Asset
            </h1>
            <p className="text-muted-foreground">
              Split your intellectual property into fractions for distributed ownership
            </p>
          </div>

          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((s, idx) => (
                <div key={s.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        step >= s.number
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {step > s.number ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </div>
                    <p
                      className={`mt-2 text-sm font-medium ${
                        step >= s.number ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {s.title}
                    </p>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 transition-colors ${
                        step > s.number ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle>
                Step {step}: {steps[step - 1].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="supply">Total Supply of Fractions</Label>
                    <Input
                      id="supply"
                      type="number"
                      value={supply}
                      onChange={(e) => setSupply(e.target.value)}
                      placeholder="Enter total supply"
                    />
                    <p className="text-sm text-muted-foreground">
                      The total number of fractions your IP will be divided into
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground mb-2">Supply Preview</p>
                    <p className="text-2xl font-bold text-foreground">
                      {Number(supply).toLocaleString()} fractions
                    </p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="royalty">Royalty Rate (%)</Label>
                    <Input
                      id="royalty"
                      type="number"
                      value={royalty}
                      onChange={(e) => setRoyalty(e.target.value)}
                      placeholder="Enter royalty rate"
                      min="0"
                      max="100"
                    />
                    <p className="text-sm text-muted-foreground">
                      The percentage of derivative earnings distributed to fraction holders
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fraction Holders</span>
                      <span className="font-semibold text-foreground">{royalty}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Original Creator</span>
                      <span className="font-semibold text-foreground">
                        {100 - Number(royalty)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Supply</p>
                      <p className="text-2xl font-bold text-foreground">
                        {Number(supply).toLocaleString()} fractions
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Royalty Rate</p>
                      <p className="text-2xl font-bold text-secondary">{royalty}%</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <Badge variant="secondary" className="text-base">
                        Ready to Deploy
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-2">
                      By proceeding, you agree to fractionalize your IP asset on Story Protocol
                      with the parameters shown above.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                {step > 1 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                    Previous
                  </Button>
                )}
                {step < 3 ? (
                  <Button onClick={() => setStep(step + 1)} className="flex-1">
                    Next
                  </Button>
                ) : (
                  <Button onClick={handleComplete} className="flex-1">
                    Complete Fractionalization
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Fractionalize;
