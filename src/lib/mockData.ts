export interface IPAsset {
  id: string;
  title: string;
  creator: string;
  image: string;
  type: string;
  totalSupply: number;
  availableFractions: number;
  pricePerFraction: number;
  royaltyRate: number;
  totalEarnings: number;
  derivatives: Derivative[];
  metadata: {
    created: string;
    license: string;
    tags: string[];
  };
}

export interface Derivative {
  id: string;
  title: string;
  creator: string;
  type: string;
}

export interface UserFraction {
  assetId: string;
  assetTitle: string;
  image: string;
  fractionsOwned: number;
  totalSupply: number;
  currentValue: number;
  projectedMonthlyEarnings: number;
}

export const mockAssets: IPAsset[] = [
  {
    id: "ip-001",
    title: "Cosmic Dreams Collection",
    creator: "0x742d...4f8a",
    image: "/src/assets/asset-1.jpg",
    type: "Digital Art",
    totalSupply: 10000,
    availableFractions: 7500,
    pricePerFraction: 0.05,
    royaltyRate: 10,
    totalEarnings: 45.8,
    derivatives: [
      { id: "d1", title: "Cosmic Dreams Remix", creator: "0x123d...9a1c", type: "Derivative Art" },
      { id: "d2", title: "Dreams in Motion", creator: "0x456e...2b3d", type: "Animation" },
    ],
    metadata: {
      created: "2024-01-15",
      license: "CC BY-NC",
      tags: ["Art", "Digital", "Abstract"],
    },
  },
  {
    id: "ip-002",
    title: "ChronoChar IP Universe",
    creator: "0x8b3c...2a1f",
    image: "/src/assets/asset-2.jpg",
    type: "Character IP",
    totalSupply: 5000,
    availableFractions: 2000,
    pricePerFraction: 0.15,
    royaltyRate: 12,
    totalEarnings: 128.4,
    derivatives: [
      { id: "d3", title: "ChronoChar Game Assets", creator: "0x789f...4c5e", type: "Game Art" },
      { id: "d4", title: "ChronoChar Merchandise", creator: "0xabc1...6d7f", type: "Physical Goods" },
      { id: "d5", title: "ChronoChar Animation Series", creator: "0xdef2...8e9a", type: "Animation" },
    ],
    metadata: {
      created: "2023-11-22",
      license: "Commercial Use",
      tags: ["Character", "Gaming", "Entertainment"],
    },
  },
  {
    id: "ip-003",
    title: "Synthwave Sessions Vol.1",
    creator: "0x5f2a...9d4c",
    image: "/src/assets/asset-3.jpg",
    type: "Music IP",
    totalSupply: 20000,
    availableFractions: 15000,
    pricePerFraction: 0.02,
    royaltyRate: 8,
    totalEarnings: 76.3,
    derivatives: [
      { id: "d6", title: "Synthwave Remixes", creator: "0x321a...7b8c", type: "Music" },
    ],
    metadata: {
      created: "2024-02-08",
      license: "CC BY-SA",
      tags: ["Music", "Synthwave", "Electronic"],
    },
  },
];

export const mockUserFractions: UserFraction[] = [
  {
    assetId: "ip-001",
    assetTitle: "Cosmic Dreams Collection",
    image: "/src/assets/asset-1.jpg",
    fractionsOwned: 250,
    totalSupply: 10000,
    currentValue: 12.5,
    projectedMonthlyEarnings: 1.15,
  },
  {
    assetId: "ip-002",
    assetTitle: "ChronoChar IP Universe",
    image: "/src/assets/asset-2.jpg",
    fractionsOwned: 100,
    totalSupply: 5000,
    currentValue: 15.0,
    projectedMonthlyEarnings: 2.57,
  },
];
