import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  FileText,
  Image,
  Bot,
  AlertTriangle,
  CheckCircle,
  Eye,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ipEnforcementService } from '@/services/ipEnforcement';

interface DetectionResult {
  type: 'image' | 'text';
  similarity: number;
  confidence: number;
  matches: Array<{
    source: string;
    similarity: number;
    description: string;
    excerpt?: string;
  }>;
}

const IPDetectionTools: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [results, setResults] = useState<DetectionResult[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [textContent, setTextContent] = useState('');
  const [analysisType, setAnalysisType] = useState<'image' | 'text' | 'both'>('image');
  const { toast } = useToast();

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast({
        title: "Warning",
        description: "Only image files are allowed for visual detection.",
        variant: "destructive"
      });
    }
    
    setSelectedImages(imageFiles.slice(0, 10)); // Limit to 10 images
  }, [toast]);

  const startImageAnalysis = async () => {
    if (selectedImages.length === 0) {
      toast({
        title: "No Images Selected",
        description: "Please upload at least one image for analysis.",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setResults([]);

    try {
      const imageResults: DetectionResult[] = [];
      
      for (let i = 0; i < selectedImages.length; i++) {
        setScanProgress(((i + 1) / selectedImages.length) * 100);
        
        const result = await ipEnforcementService.analyzeImageSimilarity(
          selectedImages[i],
          [] // Reference images would be provided by user
        );
        
        imageResults.push({
          type: 'image',
          similarity: result.similarity,
          confidence: result.confidence,
          matches: result.matches
        });
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setResults(imageResults);
      
      const highSimilarityCount = imageResults.filter(r => r.similarity > 80).length;
      if (highSimilarityCount > 0) {
        toast({
          title: "Potential Violations Detected",
          description: `Found ${highSimilarityCount} images with high similarity scores.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: "No high-similarity matches found.",
        });
      }
      
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze images.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
      setScanProgress(100);
    }
  };

  const startTextAnalysis = async () => {
    if (!textContent.trim()) {
      toast({
        title: "No Text Content",
        description: "Please enter text content for analysis.",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setResults([]);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setScanProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      const result = await ipEnforcementService.analyzeTextSimilarity(
        textContent,
        [] // Reference texts would be provided by user
      );
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      setResults([{
        type: 'text',
        similarity: result.similarity,
        confidence: result.confidence,
        matches: result.potentialMatches
      }]);
      
      if (result.similarity > 70) {
        toast({
          title: "Potential Plagiarism Detected",
          description: `Text similarity: ${result.similarity}% confidence: ${result.confidence}%`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: "No significant text similarity found.",
        });
      }
      
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze text.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 90) return 'text-red-600';
    if (similarity >= 80) return 'text-orange-600';
    if (similarity >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getSimilarityBadgeColor = (similarity: number) => {
    if (similarity >= 90) return 'bg-red-100 text-red-800';
    if (similarity >= 80) return 'bg-orange-100 text-orange-800';
    if (similarity >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-6">
      {/* Analysis Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Detection Tools
          </CardTitle>
          <CardDescription>
            Select the type of content you want to analyze for IP violations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Button
              variant={analysisType === 'image' ? 'default' : 'outline'}
              onClick={() => setAnalysisType('image')}
              className="flex items-center gap-2"
            >
              <Image className="h-4 w-4" />
              Image Analysis
            </Button>
            <Button
              variant={analysisType === 'text' ? 'default' : 'outline'}
              onClick={() => setAnalysisType('text')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Text Analysis
            </Button>
            <Button
              variant={analysisType === 'both' ? 'default' : 'outline'}
              onClick={() => setAnalysisType('both')}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Comprehensive
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Image Analysis */}
      {(analysisType === 'image' || analysisType === 'both') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Visual IP Detection
            </CardTitle>
            <CardDescription>
              Upload images to check for copyright infringement and visual similarities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-upload">Upload Images (Max 10)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                >
                  Click to upload images or drag and drop
                </label>
                {selectedImages.length > 0 && (
                  <p className="mt-2 text-sm text-green-600">
                    {selectedImages.length} image(s) selected
                  </p>
                )}
              </div>
            </div>
            
            <Alert>
              <Eye className="h-4 w-4" />
              <AlertDescription>
                <strong>AI Powered:</strong> Using Google Vision API for advanced image similarity detection. 
                Results include reverse image search and visual pattern matching.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={startImageAnalysis} 
              disabled={isScanning || selectedImages.length === 0}
              className="w-full"
            >
              {isScanning ? (
                <>
                  <Bot className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Images... {Math.round(scanProgress)}%
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Start Visual Analysis
                </>
              )}
            </Button>
            
            {isScanning && (
              <Progress value={scanProgress} className="h-2" />
            )}
          </CardContent>
        </Card>
      )}

      {/* Text Analysis */}
      {(analysisType === 'text' || analysisType === 'both') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Text & Content Detection
            </CardTitle>
            <CardDescription>
              Analyze text content for plagiarism and unauthorized usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-content">Text Content to Analyze</Label>
              <Textarea
                id="text-content"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste your original text content here for analysis..."
                className="min-h-[120px]"
                maxLength={5000}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Characters: {textContent.length}/5000</span>
                <span>Words: {textContent.trim() ? textContent.trim().split(/\s+/).length : 0}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="semantic-analysis" 
                className="rounded" 
                defaultChecked
              />
              <Label htmlFor="semantic-analysis" className="text-sm">
                Enable semantic similarity analysis (AI-powered)
              </Label>
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="exact-match" 
                className="rounded" 
                defaultChecked
              />
              <Label htmlFor="exact-match" className="text-sm">
                Include exact phrase matching
              </Label>
            </div>
            
            <Button 
              onClick={startTextAnalysis} 
              disabled={isScanning || !textContent.trim()}
              className="w-full"
            >
              {isScanning ? (
                <>
                  <Bot className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Text... {Math.round(scanProgress)}%
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-4 w-4" />
                  Analyze Text Content
                </>
              )}
            </Button>
            
            {isScanning && (
              <Progress value={scanProgress} className="h-2" />
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Detection Results
            </CardTitle>
            <CardDescription>
              AI analysis results showing potential IP violations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {result.type === 'image' ? (
                      <Image className="h-5 w-5 text-blue-500" />
                    ) : (
                      <FileText className="h-5 w-5 text-green-500" />
                    )}
                    <span className="font-medium">
                      {result.type === 'image' ? 'Image Analysis' : 'Text Analysis'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getSimilarityBadgeColor(result.similarity)}>
                      {result.similarity}% Similar
                    </Badge>
                    <Badge variant="outline">
                      {result.confidence}% Confidence
                    </Badge>
                  </div>
                </div>
                
                {result.matches && result.matches.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Potential Matches:</h4>
                    {result.matches.map((match, matchIndex) => (
                      <div key={matchIndex} className="bg-gray-50 rounded p-3 text-sm">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-blue-600">{match.source}</span>
                          <span className={`font-medium ${getSimilarityColor(match.similarity)}`}>
                            {match.similarity}%
                          </span>
                        </div>
                        <p className="text-muted-foreground">{match.description}</p>
                        {match.excerpt && (
                          <p className="text-xs text-gray-600 mt-1 italic">"{match.excerpt}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {result.similarity > 70 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>High similarity detected!</strong> Consider taking enforcement action 
                      if this represents unauthorized use of your IP.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IPDetectionTools;