export interface Coin {
  name: string;
  symbol: string;
  percentage: number;
  price: number;
  iconUrl?: string;
}

export interface Basket {
  id: string;
  name: string;
  coins: Coin[];
  description: string;
  cagr: string;
  score: string;
  type: string;
  creator: string;
}

export const baskets: Basket[] = [
  {
    id: "1",
    name: "Blue Chips",
    description: "Blue Chips",
    cagr: "80.74%",
    score: "5.00",
    type: "Blue Chips",
    creator: "karan.sui",
    coins: [
      { name: "Wrap ETH", symbol: "WETH", percentage: 33.33, price: 1.5 },
      { name: "Scallop", symbol: "SCA", percentage: 33.33, price: 1.0 },
      { name: "Deep", symbol: "DEEP", percentage: 33.34, price: 0.5 },
    ],
  },
  {
    id: "1",
    name: "Mysten Stack",
    description: "Mysten Lab Coins",
    cagr: "80.74%",
    score: "5.00",
    type: "Blue Chips",
    creator: "",
    coins: [
      { name: "SUI", symbol: "SUI", percentage: 33.33, price: 1.5 },
      { name: "Deep", symbol: "DEEP", percentage: 33.33, price: 1.0 },
      { name: "SuiNS Token", symbol: "NS", percentage: 33.34, price: 0.5 },
    ],
  },
  {
    id: "2",
    name: "DeFi Basket",
    description: "Top DeFi protocols in Sui",
    cagr: "2.8%",
    score: "10.0",
    type: "DeFi",
    creator: "karan.sui",
    coins: [
      { name: "Cetus", symbol: "CETUS", percentage: 50, price: 1.5 },
      { name: "Scallop", symbol: "SCA", percentage: 25, price: 0.8 },
      { name: "Navi Protocol", symbol: "NAVX", percentage: 25, price: 0.5 },
    ],
  },
  {
    id: "3",
    name: "Meme",
    description: "Top Meme on SUI",
    cagr: "2.8%",
    score: "10.0",
    type: "Meme",
    creator: "karan.sui",
    coins: [
      { name: "FUD", symbol: "FUD", percentage: 50, price: 1.5 },
      { name: "PIGU", symbol: "PIGU", percentage: 25, price: 0.8 },
      { name: "Blub", symbol: "BLUB", percentage: 25, price: 0.5 },
    ],
  },
];
