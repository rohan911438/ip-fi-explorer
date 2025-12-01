import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  AlertTriangle,
  Search,
  FileText,
  Image,
  Eye,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Download,
  BarChart3,
  Gavel,
  Bot
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ViolationRecord {
  id: string;
  type: 'image' | 'text' | 'trademark' | 'patent';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'investigating' | 'action_taken' | 'resolved';
  description: string;
  source: string;
  detectedAt: string;
  confidence: number;
  evidence: string[];
}

interface DetectionStats {
  totalScans: number;
  violationsDetected: number;
  actionsTaken: number;
  successRate: number;
  lastScan: string;
}

const IPEnforcement = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [violations, setViolations] = useState<ViolationRecord[]>([]);
  const [stats, setStats] = useState<DetectionStats>({
    totalScans: 1247,
    violationsDetected: 43,
    actionsTaken: 38,
    successRate: 88.4,
    lastScan: '2 minutes ago'
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Load mock violation data
    setViolations([
      {
        id: '1',
        type: 'image',
        severity: 'high',
        status: 'detected',
        description: 'Unauthorized use of copyrighted artwork in NFT collection',
        source: 'opensea.io/collection/fake-art',
        detectedAt: '2024-12-01T10:30:00Z',
        confidence: 92,
        evidence: ['visual_similarity_match.jpg', 'metadata_comparison.json']
      },
      {
        id: '2',
        type: 'text',
        severity: 'medium',
        status: 'investigating',
        description: 'Potential trademark infringement in project description',
        source: 'github.com/fake-project',
        detectedAt: '2024-12-01T09:15:00Z',
        confidence: 78,
        evidence: ['text_analysis.txt', 'trademark_comparison.pdf']
      },
      {
        id: '3',
        type: 'trademark',
        severity: 'critical',
        status: 'action_taken',
        description: 'Direct trademark violation in smart contract name',
        source: 'etherscan.io/address/0x123...',
        detectedAt: '2024-11-30T16:45:00Z',
        confidence: 96,
        evidence: ['contract_code.sol', 'legal_notice.pdf']
      }
    ]);
  }, []);

  const startAIScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    // Simulate AI scanning process
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          toast({
            title: "AI Scan Complete",
            description: "Found 2 potential violations. Review them in the violations tab.",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600';
      case 'action_taken': return 'text-blue-600';
      case 'investigating': return 'text-yellow-600';
      case 'detected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleTakedownRequest = (violationId: string) => {
    toast({
      title: "Takedown Request Sent",
      description: "Legal takedown notice has been generated and sent to the platform.",
    });
  };

  const handleEvidenceCollection = (violationId: string) => {
    toast({
      title: "Evidence Collected",
      description: "Blockchain proof and metadata have been recorded for legal proceedings.",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">IP Enforcement & Detection</h1>
              <p className="text-muted-foreground">AI-powered tools for detecting and enforcing intellectual property violations</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Scans</p>
                  <p className="text-2xl font-bold">{stats.totalScans.toLocaleString()}</p>
                </div>
                <Search className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Violations Detected</p>
                  <p className="text-2xl font-bold text-red-500">{stats.violationsDetected}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Actions Taken</p>
                  <p className="text-2xl font-bold text-green-500">{stats.actionsTaken}</p>
                </div>
                <Gavel className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-blue-500">{stats.successRate}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="detection">AI Detection</TabsTrigger>
            <TabsTrigger value="violations">Violations</TabsTrigger>
            <TabsTrigger value="enforcement">Enforcement</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Real-time Monitoring */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Real-time Monitoring
                  </CardTitle>
                  <CardDescription>
                    Active monitoring of IP assets across platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Monitoring Status</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Scan</span>
                    <span className="text-sm">{stats.lastScan}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Coverage</span>
                      <span className="text-sm">94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                  <Button onClick={startAIScan} disabled={isScanning} className="w-full">
                    {isScanning ? (
                      <>
                        <Bot className="mr-2 h-4 w-4 animate-spin" />
                        Scanning... {scanProgress}%
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Start AI Scan
                      </>
                    )}
                  </Button>
                  {isScanning && (
                    <Progress value={scanProgress} className="h-2" />
                  )}
                </CardContent>
              </Card>

              {/* Recent Violations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Recent Violations
                  </CardTitle>
                  <CardDescription>
                    Latest IP violations detected by AI systems
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {violations.slice(0, 3).map((violation) => (
                    <div key={violation.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(violation.severity)}`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{violation.description}</p>
                        <p className="text-xs text-muted-foreground">{violation.source}</p>
                      </div>
                      <Badge className={getStatusColor(violation.status)}>
                        {violation.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    View All Violations
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Alert Section */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>AI Detection Active:</strong> Your IP assets are being monitored across 15+ platforms including OpenSea, GitHub, and major NFT marketplaces. Last scan completed 2 minutes ago with 2 new potential violations detected.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* AI Detection Tab */}
          <TabsContent value="detection" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Detection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Visual IP Detection
                  </CardTitle>
                  <CardDescription>
                    AI-powered image similarity and copyright detection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">Upload reference images or artworks</p>
                    <Button>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Images
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="similarity-threshold">Similarity Threshold: 85%</Label>
                    <Progress value={85} className="h-2" />
                  </div>
                  <Button className="w-full">
                    <Bot className="mr-2 h-4 w-4" />
                    Start Visual Scan
                  </Button>
                </CardContent>
              </Card>

              {/* Text Detection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Text & Content Detection
                  </CardTitle>
                  <CardDescription>
                    Plagiarism and unauthorized text usage detection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="text-input">Reference Text</Label>
                    <Textarea
                      id="text-input"
                      placeholder="Enter your original text content for monitoring..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="semantic-analysis" className="rounded" />
                    <Label htmlFor="semantic-analysis" className="text-sm">
                      Enable semantic similarity analysis
                    </Label>
                  </div>
                  <Button className="w-full">
                    <Bot className="mr-2 h-4 w-4" />
                    Analyze Text Content
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Detection Results */}
            <Card>
              <CardHeader>
                <CardTitle>Detection Results</CardTitle>
                <CardDescription>
                  Real-time results from AI detection algorithms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="mx-auto h-16 w-16 mb-4 text-gray-300" />
                  <p>No active detection scans. Start a scan above to see results.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Violations Tab */}
          <TabsContent value="violations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Violation Records</CardTitle>
                <CardDescription>
                  Complete history of detected IP violations and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {violations.map((violation) => (
                    <div key={violation.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={`${getSeverityColor(violation.severity)} text-white`}>
                              {violation.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              {violation.type.toUpperCase()}
                            </Badge>
                            <span className={`text-sm font-medium ${getStatusColor(violation.status)}`}>
                              {violation.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <h4 className="font-medium mb-1">{violation.description}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Source: {violation.source}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Detected: {new Date(violation.detectedAt).toLocaleDateString()}</span>
                            <span>Confidence: {violation.confidence}%</span>
                            <span>Evidence: {violation.evidence.length} files</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEvidenceCollection(violation.id)}>
                            <Download className="h-4 w-4 mr-1" />
                            Evidence
                          </Button>
                          <Button size="sm" onClick={() => handleTakedownRequest(violation.id)}>
                            <Gavel className="h-4 w-4 mr-1" />
                            Takedown
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enforcement Tab */}
          <TabsContent value="enforcement" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Takedown Requests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gavel className="h-5 w-5" />
                    Takedown Requests
                  </CardTitle>
                  <CardDescription>
                    Generate and send legal takedown notices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform">Target Platform</Label>
                    <Input id="platform" placeholder="e.g., opensea.io, github.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="violation-url">Violation URL</Label>
                    <Input id="violation-url" placeholder="URL of the infringing content" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="legal-basis">Legal Basis</Label>
                    <Textarea id="legal-basis" placeholder="Copyright infringement, trademark violation, etc." />
                  </div>
                  <Button className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Takedown Notice
                  </Button>
                </CardContent>
              </Card>

              {/* Evidence Collection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Evidence Collection
                  </CardTitle>
                  <CardDescription>
                    Blockchain-based evidence recording and timestamping
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Evidence is automatically recorded on Story Protocol blockchain for immutable proof of IP violations.
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Screenshots captured</span>
                      <Badge>12 files</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Metadata extracted</span>
                      <Badge>Verified</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Blockchain proof</span>
                      <Badge className="bg-green-100 text-green-800">Recorded</Badge>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Evidence Package
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Detection Accuracy</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-green-500 mb-2">94.2%</div>
                  <p className="text-sm text-muted-foreground">AI model accuracy rate</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Response Time</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-blue-500 mb-2">2.3s</div>
                  <p className="text-sm text-muted-foreground">Average detection time</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Enforcement Success</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-purple-500 mb-2">88%</div>
                  <p className="text-sm text-muted-foreground">Successful takedowns</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Platform Coverage</CardTitle>
                <CardDescription>
                  Monitoring coverage across different platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { platform: 'OpenSea', coverage: 98, violations: 12 },
                  { platform: 'GitHub', coverage: 95, violations: 8 },
                  { platform: 'Rarible', coverage: 87, violations: 5 },
                  { platform: 'Foundation', coverage: 92, violations: 3 },
                  { platform: 'SuperRare', coverage: 89, violations: 2 }
                ].map((item) => (
                  <div key={item.platform} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.platform}</span>
                      <div className="flex gap-4">
                        <span className="text-xs text-muted-foreground">
                          {item.violations} violations
                        </span>
                        <span className="text-xs font-medium">{item.coverage}%</span>
                      </div>
                    </div>
                    <Progress value={item.coverage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IPEnforcement;