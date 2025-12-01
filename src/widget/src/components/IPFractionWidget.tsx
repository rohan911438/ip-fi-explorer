import React, { useState, useEffect } from 'react';
import { Calculator, ExternalLink } from 'lucide-react';
import '../widget.css';

export interface IPFractionWidgetProps {
  width?: number;
  height?: number;
  theme?: 'light' | 'dark' | 'auto';
  showPoweredBy?: boolean;
  borderRadius?: number;
  className?: string;
  onCalculate?: (data: {
    fractions: number;
    totalCost: number;
    estimatedReturn: number;
    pricePerFraction: number;
  }) => void;
  assetId?: string;
  assetName?: string;
  customPricePerFraction?: number;
  customRoyaltyRate?: number;
}

export const IPFractionWidget: React.FC<IPFractionWidgetProps> = ({
  width = 400,
  height = 600,
  theme = 'light',
  showPoweredBy = true,
  borderRadius = 8,
  className = '',
  onCalculate,
  assetId,
  assetName = 'IP Asset',
  customPricePerFraction = 0.05,
  customRoyaltyRate = 10,
}) => {
  const [fractions, setFractions] = useState(100);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(theme);

  // Auto theme detection
  useEffect(() => {
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setCurrentTheme(prefersDark ? 'dark' : 'light');
    } else {
      setCurrentTheme(theme);
    }
  }, [theme]);

  const pricePerFraction = customPricePerFraction;
  const royaltyRate = customRoyaltyRate;
  const totalCost = fractions * pricePerFraction;
  const estimatedReturn = (totalCost * (royaltyRate / 100)) / 12;

  const handleCalculate = () => {
    setIsCalculating(true);
    
    const calculationData = {
      fractions,
      totalCost,
      estimatedReturn,
      pricePerFraction,
      assetId,
      assetName,
    };

    // Simulate API call
    setTimeout(() => {
      setIsCalculating(false);
      onCalculate?.(calculationData);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setFractions(value);
  };

  const widgetStyle: React.CSSProperties = {
    width: width,
    height: height,
    borderRadius: `${borderRadius}px`,
  };

  const themeClass = currentTheme === 'dark' ? 'ipfi-widget-dark' : 'ipfi-widget-light';

  return (
    <div 
      className={`ipfi-widget ${themeClass} ${className}`} 
      style={widgetStyle}
    >
      <div className="ipfi-widget-container">
        {/* Header */}
        <div className="ipfi-widget-header">
          <div className="ipfi-widget-icon">
            <Calculator size={20} />
          </div>
          <h3 className="ipfi-widget-title">IP Fraction Calculator</h3>
        </div>

        {/* Asset Info */}
        {assetName && (
          <div className="ipfi-widget-asset-info">
            <div className="ipfi-widget-asset-name">{assetName}</div>
            {assetId && (
              <div className="ipfi-widget-asset-id">ID: {assetId}</div>
            )}
          </div>
        )}

        {/* Input Section */}
        <div className="ipfi-widget-form">
          <div className="ipfi-widget-input-group">
            <label htmlFor="fractions" className="ipfi-widget-label">
              Number of Fractions
            </label>
            <input
              id="fractions"
              type="number"
              className="ipfi-widget-input"
              value={fractions}
              onChange={handleInputChange}
              min="1"
              max="10000"
            />
          </div>

          {/* Calculation Results */}
          <div className="ipfi-widget-results">
            <div className="ipfi-widget-result-row">
              <span className="ipfi-widget-result-label">Price per Fraction</span>
              <span className="ipfi-widget-result-value">{pricePerFraction} ETH</span>
            </div>
            <div className="ipfi-widget-result-row">
              <span className="ipfi-widget-result-label">Total Cost</span>
              <span className="ipfi-widget-result-value ipfi-widget-result-primary">
                {totalCost.toFixed(4)} ETH
              </span>
            </div>
            <div className="ipfi-widget-result-row">
              <span className="ipfi-widget-result-label">Est. Monthly Return</span>
              <span className="ipfi-widget-result-value ipfi-widget-result-success">
                ~{estimatedReturn.toFixed(4)} ETH
              </span>
            </div>
            <div className="ipfi-widget-result-row">
              <span className="ipfi-widget-result-label">Royalty Rate</span>
              <span className="ipfi-widget-result-value">{royaltyRate}%</span>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            className={`ipfi-widget-button ${isCalculating ? 'ipfi-widget-button-loading' : ''}`}
            onClick={handleCalculate}
            disabled={isCalculating}
          >
            {isCalculating ? (
              <span className="ipfi-widget-loading">
                <div className="ipfi-widget-spinner"></div>
                Calculating...
              </span>
            ) : (
              <>
                <Calculator size={16} />
                Calculate Investment
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="ipfi-widget-footer">
          {showPoweredBy && (
            <div className="ipfi-widget-powered-by">
              <span>Powered by</span>
              <a 
                href="https://ip-fi-explorer.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ipfi-widget-link"
              >
                IP-Fi Swap
                <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IPFractionWidget;