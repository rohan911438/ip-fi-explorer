import React from 'react';
import { IPFractionWidget } from './src/widget/src/components/IPFractionWidget';

const TestWidget = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
      <h1>Testing IP-Fi Widget</h1>
      <IPFractionWidget 
        width={400}
        height={600}
        theme="light"
        assetName="Test IP Asset"
        onCalculate={(data) => {
          console.log('Widget calculation result:', data);
          alert(`Calculated: ${data.fractions} fractions for ${data.totalCost} ETH`);
        }}
      />
    </div>
  );
};

export default TestWidget;