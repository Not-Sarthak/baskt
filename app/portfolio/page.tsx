"use client";
import React, { useState, useEffect } from "react";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SuiPriceServiceConnection } from "@pythnetwork/pyth-sui-js";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { RefreshCw } from "lucide-react";

interface TokenConfig {
  symbol: string;
  name: string;
  coinType: string;
  pythId: string;
  color: string;
  decimals: number;
}

interface TokenHolding {
  symbol: string;
  amount: number;
  price: number;
  value: number;
  color: string;
}

const TOKENS: TokenConfig[] = [
  {
    symbol: "SUI",
    name: "Sui",
    coinType: "0x2::sui::SUI",
    pythId:
      "0x50c67b3fd225db8912a424dd4baed60ffdde625ed2feaaf283724f9608fea266",
    color: "#0088FE",
    decimals: 9,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    coinType:
      "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
    pythId:
      "0x41f3625971ca2ed2263e78573fe5ce23e13d2558ed3f2e47ab0f84fb9e7ae722",
    color: "#00C49F",
    decimals: 6,
  },
  {
    symbol: "WETH",
    name: "Wrapped Ethereum",
    coinType:
      "0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN",
    pythId:
      "0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6",
    color: "#FFBB28",
    decimals: 8,
  },
];

const PortfolioPage = () => {
  const [holdings, setHoldings] = useState<TokenHolding[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const rpcUrl = getFullnodeUrl("mainnet");
  const client = new SuiClient({ url: rpcUrl });

  const pythConnection = new SuiPriceServiceConnection(
    "https://hermes-beta.pyth.network"
  );
  const getWalletAddress = () => {
    const wallet = localStorage.getItem("suiWallet");
    if (!wallet) return null;
    return JSON.parse(wallet).address;
  };

  const getPrice = (priceFeed: any) => {
    if (!priceFeed) return 0;
    try {
      // Using the spot price instead of EMA
      if (priceFeed.price) {
        const priceData = priceFeed.price;
        // Convert to standard decimal format
        // If expo is -8 and price is "336746400", this will give us 3.367464
        return Number(priceData.price) * Math.pow(10, priceData.expo);
      }
      return 0;
    } catch (error) {
      console.error("Error getting price:", error);
      return 0;
    }
  };

  const formatBalance = (balance: string, decimals: number): number => {
    return Number(balance) / Math.pow(10, decimals);
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const walletAddress = getWalletAddress();
      if (!walletAddress) {
        throw new Error("No wallet connected");
      }

      // Fetch balances for all tokens
      const balances = await Promise.all(
        TOKENS.map((token) =>
          client
            .getBalance({
              owner: walletAddress,
              coinType: token.coinType,
            })
            .catch(() => ({ totalBalance: "0" }))
        )
      );

      // Getting price from the pYth
      const priceFeeds = await pythConnection.getLatestPriceFeeds(
        TOKENS.map((token) => token.pythId)
      );
      console.log(priceFeeds, "price feeds");

      // Combine balances with prices
      const updatedHoldings = TOKENS.map((token, index) => {
        const balance = formatBalance(
          balances[index].totalBalance,
          token.decimals
        );
        const priceFeed = priceFeeds ? priceFeeds[index] : null;

        const price = getPrice(priceFeed);
        const value = balance * price;

        return {
          symbol: token.symbol,
          name: token.name,
          amount: balance,
          price: price,
          value: value,
          color: token.color,
        };
      });

      const total = updatedHoldings.reduce(
        (sum, holding) => sum + holding.value,
        0
      );

      setHoldings(updatedHoldings);
      setTotalValue(total);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // const interval = setInterval(fetchData, 30000);
    // return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Portfolio Overview</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchData}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              $
              {totalValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={holdings.filter((h) => h.value > 0)}
                  dataKey="value"
                  nameKey="symbol"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {holdings.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) =>
                    `$${value.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {holdings.map((holding) => (
          <Card key={holding.symbol}>
            <CardHeader>
              <CardTitle>{holding.symbol}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-xl font-semibold">
                    {holding.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-xl font-semibold">
                    $
                    {holding.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Value</p>
                  <p className="text-xl font-semibold">
                    $
                    {holding.value.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PortfolioPage;
