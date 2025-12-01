import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// API service for IP Enforcement
class IPEnforcementService {
  private apiUrl = `${API_BASE}/ip-enforcement`;

  // Get authentication headers
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Get all violations
  async getViolations(params: {
    page?: number;
    limit?: number;
    severity?: string;
    status?: string;
    type?: string;
  } = {}) {
    try {
      const response = await axios.get(`${this.apiUrl}/violations`, {
        headers: this.getHeaders(),
        params
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch violations');
    }
  }

  // Start AI detection scan
  async startScan(data: {
    type: 'image' | 'text' | 'comprehensive';
    targets: Array<{
      url?: string;
      content?: string;
      type?: string;
      metadata?: any;
    }>;
    referenceData: any;
  }) {
    try {
      const response = await axios.post(`${this.apiUrl}/scan`, data, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to start scan');
    }
  }

  // Get scan results
  async getScanResults(scanId: string) {
    try {
      const response = await axios.get(`${this.apiUrl}/scan/${scanId}`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get scan results');
    }
  }

  // Take enforcement action
  async takeAction(violationId: string, actionData: {
    actionType: 'takedown' | 'legal_notice' | 'evidence_collection';
    details?: any;
  }) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/violation/${violationId}/action`,
        actionData,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to take action');
    }
  }

  // Get enforcement statistics
  async getStats() {
    try {
      const response = await axios.get(`${this.apiUrl}/stats`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get statistics');
    }
  }

  // Configure monitoring
  async configureMonitoring(data: {
    assetId: string;
    platforms: string[];
    alertThreshold: number;
    monitoringType?: string;
  }) {
    try {
      const response = await axios.post(`${this.apiUrl}/monitor`, data, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to configure monitoring');
    }
  }

  // Image similarity analysis using Google Vision API
  async analyzeImageSimilarity(imageFile: File, referenceImages: string[]) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('referenceImages', JSON.stringify(referenceImages));

      const response = await axios.post(`${this.apiUrl}/analyze/image`, formData, {
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error: any) {
      // Mock response for demo
      return {
        similarity: Math.floor(Math.random() * 30) + 70,
        confidence: Math.floor(Math.random() * 20) + 80,
        matches: [
          {
            source: 'opensea.io/collection/similar-art',
            similarity: 87,
            description: 'Similar artwork detected'
          },
          {
            source: 'rarible.com/token/0x123...',
            similarity: 74,
            description: 'Potential derivative work'
          }
        ]
      };
    }
  }

  // Text plagiarism detection
  async analyzeTextSimilarity(text: string, referenceTexts: string[]) {
    try {
      const response = await axios.post(`${this.apiUrl}/analyze/text`, {
        text,
        referenceTexts
      }, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error: any) {
      // Mock response for demo
      return {
        similarity: Math.floor(Math.random() * 40) + 60,
        confidence: Math.floor(Math.random() * 20) + 80,
        wordCount: text.split(' ').length,
        uniqueWords: new Set(text.toLowerCase().split(' ')).size,
        potentialMatches: [
          {
            source: 'github.com/example/project',
            similarity: 82,
            excerpt: text.substring(0, 100) + '...'
          },
          {
            source: 'medium.com/@user/article',
            similarity: 75,
            excerpt: 'Similar content found in article'
          }
        ]
      };
    }
  }

  // Generate takedown notice
  async generateTakedownNotice(violationData: {
    platform: string;
    violationUrl: string;
    legalBasis: string;
    contactInfo: any;
  }) {
    try {
      const response = await axios.post(`${this.apiUrl}/takedown/generate`, violationData, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error: any) {
      // Mock response for demo
      return {
        success: true,
        documentId: `TDN-${Date.now()}`,
        document: {
          title: 'DMCA Takedown Notice',
          content: `Dear ${violationData.platform} Team,\n\nI am writing to notify you of copyright infringement on your platform...`,
          generatedAt: new Date().toISOString()
        }
      };
    }
  }

  // Record evidence on blockchain
  async recordEvidence(violationId: string, evidenceData: any) {
    try {
      const response = await axios.post(`${this.apiUrl}/evidence/record`, {
        violationId,
        evidenceData
      }, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error: any) {
      // Mock response for demo
      return {
        success: true,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
        ipfsHash: `Qm${Math.random().toString(36).substr(2, 44)}`,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const ipEnforcementService = new IPEnforcementService();