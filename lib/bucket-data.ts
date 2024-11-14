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
        name: "Meme Stack",
        description: "MEme",
        cagr: "80.74%",
        score: "5.00",
        type: "Meme",
        creator: "GqkJ...2tJm",
        coins: [
          { name: "Solana", symbol: "SOL", percentage: 33.33, price: 1.5 },
          { name: "USD Coin", symbol: "USDC", percentage: 33.33, price: 1.0 },
          { name: "Frog", symbol: "FWOG", percentage: 33.34, price: 0.5 },
        ],
      },
  {
    id: "2",
    name: "DeFi Basket",
    description: "Top DeFi protocols in Sui",
    cagr: "2.8%",
    score: "10.0",
    type: "RWA",
    creator: "FewJ...2tJm",
    coins: [
      { name: "Sui", symbol: "SUI", percentage: 50, price: 1.5 },
      { name: "Deep Book", symbol: "DEEP", percentage: 25, price: 0.8 },
      { name: "Navi Protocol", symbol: "NS", percentage: 25, price: 0.5 },
    ],
  },
];
