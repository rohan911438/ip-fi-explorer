import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Copy, Check, Code, Palette, Monitor, Smartphone, Tablet, Download, ExternalLink, Settings, Zap, Shield, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const Widget = () => {
  const [fractions, setFractions] = useState(100);
  const [copied, setCopied] = useState(false);
  const [widgetWidth, setWidgetWidth] = useState(400);
  const [widgetHeight, setWidgetHeight] = useState(600);
  const [theme, setTheme] = useState('light');
  const [borderRadius, setBorderRadius] = useState(8);
  const [showPoweredBy, setShowPoweredBy] = useState(true);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const { toast } = useToast();

  const pricePerFraction = 0.05;
  const royaltyRate = 10;
  const totalCost = fractions * pricePerFraction;
  const estimatedReturn = (totalCost * (royaltyRate / 100)) / 12;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const embedCode = `<iframe 
  src="${baseUrl}/widget?theme=${theme}&powered=${showPoweredBy}&radius=${borderRadius}" 
  width="${widgetWidth}" 
  height="${widgetHeight}" 
  frameborder="0"
  style="border-radius: ${borderRadius}px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
  allowtransparency="true">
</iframe>`;

  const reactCode = `import { IPFractionWidget } from '@ip-fi-swap/widget';

function MyApp() {
  return (
    <IPFractionWidget 
      width={${widgetWidth}}
      height={${widgetHeight}}
      theme="${theme}"
      showPoweredBy={${showPoweredBy}}
      borderRadius={${borderRadius}}
      onCalculate={(data) => console.log(data)}
    />
  );
}`;

  const npmInstall = 'npm install @ip-fi-swap/widget';

  const getDeviceStyles = () => {
    switch (previewDevice) {
      case 'mobile':
        return { width: '375px', height: '600px' };
      case 'tablet':
        return { width: '768px', height: '600px' };
      default:
        return { width: `${widgetWidth}px`, height: `${widgetHeight}px` };
    }
  };

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
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Code className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">
                Embeddable IP Fraction Widget
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
              Integrate our powerful IP fraction calculator into your website or application with just a few lines of code. 
              Fully customizable, responsive, and connected to Story Protocol for real-time data.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Real-time Data
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Secure
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Open Source
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="preview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="preview">Live Preview</TabsTrigger>
              <TabsTrigger value="embed">Embed Code</TabsTrigger>
              <TabsTrigger value="react">React Component</TabsTrigger>
              <TabsTrigger value="docs">Documentation</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-6">
              {/* Customization Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Customization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Widget Dimensions</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Width</Label>
                          <Input
                            type="number"
                            value={widgetWidth}
                            onChange={(e) => setWidgetWidth(Number(e.target.value))}
                            min={300}
                            max={800}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Height</Label>
                          <Input
                            type="number"
                            value={widgetHeight}
                            onChange={(e) => setWidgetHeight(Number(e.target.value))}
                            min={400}
                            max={800}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="auto">Auto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Border Radius</Label>
                      <Input
                        type="number"
                        value={borderRadius}
                        onChange={(e) => setBorderRadius(Number(e.target.value))}
                        min={0}
                        max={20}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Show "Powered by" branding</Label>
                      <Switch
                        checked={showPoweredBy}
                        onCheckedChange={setShowPoweredBy}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Preview Device</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPreviewDevice('desktop')}
                        >
                          <Monitor className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPreviewDevice('tablet')}
                        >
                          <Tablet className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPreviewDevice('mobile')}
                        >
                          <Smartphone className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Live Preview */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Live Preview
                    </h2>
                    <Badge variant="outline">{previewDevice} view</Badge>
                  </div>
                  
                  <div className="flex justify-center bg-muted/30 rounded-lg p-8">
                    <div 
                      className="transition-all duration-300 ease-in-out"
                      style={getDeviceStyles()}
                    >
                      <Card 
                        className={`shadow-xl h-full ${theme === 'dark' ? 'dark bg-slate-900 text-white' : 'bg-white'}`}
                        style={{ borderRadius: `${borderRadius}px` }}
                      >
                        <CardHeader>
                          <CardTitle className="text-center flex items-center justify-center gap-2">
                            <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                              <span className="text-primary-foreground font-bold text-xs">IP</span>
                            </div>
                            IP Fraction Calculator
                          </CardTitle>
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
                              className={theme === 'dark' ? 'bg-slate-800 border-slate-700' : ''}
                            />
                          </div>

                          <div className={`space-y-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-muted'}`}>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Price per Fraction</span>
                              <span className="text-sm font-medium">{pricePerFraction} ETH</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Total Cost</span>
                              <span className="font-semibold">{totalCost.toFixed(4)} ETH</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Est. Monthly Return</span>
                              <span className="font-semibold text-green-500">~{estimatedReturn.toFixed(4)} ETH</span>
                            </div>
                          </div>

                          <Button className="w-full" size="lg">
                            Calculate Investment
                          </Button>

                          {showPoweredBy && (
                            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                              Powered by 
                              <span className="font-semibold">IP-Fi Swap</span>
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="embed" className="space-y-6">

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    HTML Embed Code
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Copy this code to your website</Label>
                      <Button size="sm" variant="outline" onClick={handleCopy}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                    <div className="relative">
                      <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto max-h-40">
                        <code className="text-foreground">{embedCode}</code>
                      </pre>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Configuration Options
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">URL Parameters</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div><code className="bg-muted px-1 rounded">theme</code> - light, dark, or auto</div>
                          <div><code className="bg-muted px-1 rounded">powered</code> - true/false for branding</div>
                          <div><code className="bg-muted px-1 rounded">radius</code> - border radius (0-20)</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Styling Options</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>• Fully responsive design</div>
                          <div>• Custom CSS variables supported</div>
                          <div>• Box shadow included</div>
                          <div>• Transparent background option</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Integration Tips</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Add the iframe to any HTML page. No JavaScript required. The widget automatically
                          adapts to your site's theme and responds to user interactions.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="react" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    React Component
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium">1. Install the package</Label>
                    <div className="relative mt-2">
                      <pre className="p-3 rounded-lg bg-muted text-sm">
                        <code className="text-foreground">{npmInstall}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          navigator.clipboard.writeText(npmInstall);
                          toast({ title: "Copied to clipboard!", description: "NPM install command copied." });
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">2. Use the component</Label>
                    <div className="relative mt-2">
                      <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto max-h-60">
                        <code className="text-foreground">{reactCode}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          navigator.clipboard.writeText(reactCode);
                          toast({ title: "Copied to clipboard!", description: "React code copied." });
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Props</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div><code className="bg-muted px-1 rounded">width</code> - Widget width in pixels</div>
                        <div><code className="bg-muted px-1 rounded">height</code> - Widget height in pixels</div>
                        <div><code className="bg-muted px-1 rounded">theme</code> - Color theme</div>
                        <div><code className="bg-muted px-1 rounded">onCalculate</code> - Callback function</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">TypeScript Support</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>• Full TypeScript definitions</div>
                        <div>• IntelliSense support</div>
                        <div>• Type-safe event callbacks</div>
                        <div>• Props validation</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="docs" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                        <div>
                          <h4 className="font-medium">Real-time Data</h4>
                          <p className="text-sm text-muted-foreground">Connected to Story Protocol for live pricing and availability</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                        <div>
                          <h4 className="font-medium">Responsive Design</h4>
                          <p className="text-sm text-muted-foreground">Works perfectly on desktop, tablet, and mobile devices</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                        <div>
                          <h4 className="font-medium">Customizable</h4>
                          <p className="text-sm text-muted-foreground">Extensive theming and configuration options</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                        <div>
                          <h4 className="font-medium">Lightweight</h4>
                          <p className="text-sm text-muted-foreground">No external dependencies, fast loading</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security & Privacy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                        <div>
                          <h4 className="font-medium">No Data Collection</h4>
                          <p className="text-sm text-muted-foreground">Widget doesn't collect or store user data</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                        <div>
                          <h4 className="font-medium">HTTPS Secure</h4>
                          <p className="text-sm text-muted-foreground">All communications encrypted and secure</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                        <div>
                          <h4 className="font-medium">Open Source</h4>
                          <p className="text-sm text-muted-foreground">Fully transparent, auditable code</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                        <div>
                          <h4 className="font-medium">GDPR Compliant</h4>
                          <p className="text-sm text-muted-foreground">Meets European privacy standards</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Integration Examples</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg border border-border">
                        <h4 className="font-medium mb-2">Content Sites</h4>
                        <p className="text-sm text-muted-foreground">Add to blog posts about IP investment</p>
                      </div>
                      <div className="p-4 rounded-lg border border-border">
                        <h4 className="font-medium mb-2">Financial Platforms</h4>
                        <p className="text-sm text-muted-foreground">Embed in investment calculators</p>
                      </div>
                      <div className="p-4 rounded-lg border border-border">
                        <h4 className="font-medium mb-2">Creator Tools</h4>
                        <p className="text-sm text-muted-foreground">Help creators show potential earnings</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Widget;
