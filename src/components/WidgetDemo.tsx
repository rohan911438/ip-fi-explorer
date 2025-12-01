import React from 'react';
import { IPFractionWidget } from '../widget/src/components/IPFractionWidget';

const WidgetDemo: React.FC = () => {
  const handleCalculate = (data: any) => {
    console.log('Widget calculation:', data);
    alert(`Total cost: ${data.totalCost} ETH for ${data.fractions} fractions`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">IP-Fi Widget Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Default Widget</h2>
          <IPFractionWidget
            onCalculate={handleCalculate}
            assetName="Creative Commons Music Collection"
            assetId="CC-001"
          />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Dark Theme Widget</h2>
          <IPFractionWidget
            theme="dark"
            width={400}
            height={550}
            borderRadius={12}
            showPoweredBy={false}
            onCalculate={handleCalculate}
            assetName="Digital Art NFT Collection"
            assetId="ART-007"
            customPricePerFraction={0.1}
            customRoyaltyRate={15}
          />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Compact Widget</h2>
          <IPFractionWidget
            width={350}
            height={500}
            theme="light"
            borderRadius={6}
            onCalculate={handleCalculate}
            assetName="Patent Portfolio"
          />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Custom Styling Widget</h2>
          <IPFractionWidget
            width={400}
            height={600}
            theme="auto"
            borderRadius={16}
            className="custom-widget-demo"
            onCalculate={handleCalculate}
            assetName="Software License Bundle"
            customPricePerFraction={0.025}
            customRoyaltyRate={8}
          />
        </div>
      </div>
    </div>
  );
};

export default WidgetDemo;