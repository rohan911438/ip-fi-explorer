# ip-fi-swap-widget

A React component for embedding IP fraction calculators in your applications.

**📦 [View on NPM](https://www.npmjs.com/package/ip-fi-swap-widget)**

## Installation

```bash
npm install ip-fi-swap-widget
```

## Quick Start

```jsx
import { IPFractionWidget } from 'ip-fi-swap-widget';

function App() {
  return (
    <IPFractionWidget 
      onCalculate={(data) => console.log(data)}
      assetName="My IP Asset"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | `400` | Widget width in pixels |
| `height` | `number` | `600` | Widget height in pixels |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | Color theme |
| `showPoweredBy` | `boolean` | `true` | Show branding footer |
| `borderRadius` | `number` | `8` | Border radius in pixels |
| `assetName` | `string` | `'IP Asset'` | Display name |
| `assetId` | `string` | `undefined` | Asset identifier |
| `customPricePerFraction` | `number` | `0.05` | Price per fraction (ETH) |
| `customRoyaltyRate` | `number` | `10` | Royalty rate percentage |
| `onCalculate` | `function` | `undefined` | Callback for calculations |

## License

MIT