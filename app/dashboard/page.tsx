"use client";
import React, { useState } from "react";
import {
  Card,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buildTx, getQuote } from "@7kprotocol/sdk-ts";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import toast from "react-hot-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PortfolioCard from "@/components/layout/cards/portfolio-card";
import { ClipboardList, TrendingUp, Bookmark } from "lucide-react";
import { baskets } from "@/lib/bucket-data";
import Link from "next/link";

interface Coin {
  name: string;
  symbol: string;
  percentage: number;
  price: number;
}

interface Basket {
  id: string;
  name: string;
  coins: Coin[];
  description: string;
  cagr: string;
  score: string;
}

interface SwapResult {
  status: "pending" | "success" | "error";
  digest?: string;
  error?: string;
}

const USDC_ADDRESS =
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC";

const BasketCard = ({ basket }: { basket: Basket }) => {
  const slugifiedName = basket.name.toLowerCase().replace(/\s+/g, '-');

  return (
    <Link href={`/dashboard/${slugifiedName}`}>
    <Card className="max-w-md p-4 bg-[#f5f5f5] dark:bg-card rounded-2xl shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" />
            <div className="w-8 h-8 bg-orange-500 rounded-full -ml-2" />
            <div className="w-8 h-8 bg-green-500 rounded-full -ml-2 flex items-center justify-center" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">{basket.name}</h2>
            <p className="text-sm text-gray-500">by GqkJ...2tJm</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bookmark className="h-5 w-5" />
        </Button>
      </div>

      <p className="text-gray-600 dark:text-white/70 text-sm mt-3 mb-6">{basket.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 dark:bg-[#0f0f0f] border-gray-300 dark:border-gray-700 shadow-sm border-[1px] rounded-2xl">
        <div className="p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500 mb-1 font-semibold">1M CAGR</p>
          <p className="text-lg font-semibold text-green-500">{basket.cagr}</p>
        </div>
        <div className="p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500 mb-1 font-semibold">Stack Score</p>
          <p className="text-lg font-semibold text-red-400">{basket.score}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="w-full bg-black rounded-xl text-white"
        >
          Share on X
        </Button>
        <Button className="w-full bg-indigo-500 rounded-xl hover:bg-indigo-600">
          Instant Buy
        </Button>
      </div>
    </Card>
    </Link>
  );
};

const BasketDialog = ({ basket }: { basket: Basket }) => {
  const [allocations, setAllocations] = useState(
    basket.coins.map((c) => c.percentage)
  );
  const [investment, setInvestment] = useState(100);
  const [swapResults, setSwapResults] = useState<SwapResult[]>([]);
  const [isSwapping, setIsSwapping] = useState(false);
  const rpcUrl = getFullnodeUrl("mainnet");
  const client = new SuiClient({ url: rpcUrl });

  const checkWallet = () => {
    const wallet = localStorage.getItem("suiWallet");
    if (!wallet) {
      toast.error("Please connect your wallet first", { id: "wallet-check" });
      return null;
    }
    try {
      return JSON.parse(wallet);
    } catch {
      toast.error("Invalid wallet data", { id: "wallet-check" });
      return null;
    }
  };

  const performSwap = async (
    tokenOut: string,
    amount: string
  ): Promise<SwapResult> => {
    const wallet = checkWallet();
    if (!wallet) return { status: "error", error: "No wallet connected" };

    try {
      toast.loading(`Swapping for ${tokenOut}...`, { id: tokenOut });

      const keyPair = Ed25519Keypair.fromSecretKey(wallet.privateKey);
      const quoteResponse = await getQuote({
        tokenIn: USDC_ADDRESS,
        tokenOut,
        amountIn: amount,
      });

      const result = await buildTx({
        quoteResponse,
        accountAddress: wallet.address,
        slippage: 0.01,
        commission: {
          partner:
            "0x89960536d44ae8078f08aa442c0aa3081c0cf21b6bcca5597951f1671642af75",
          commissionBps: 0,
        },
      });

      if (!result?.tx) throw new Error("Failed to build transaction");
      // result.tx.setGasBudget(100000000);

      const response = await client.signAndExecuteTransaction({
        signer: keyPair,
        transaction: result.tx,
        requestType: "WaitForLocalExecution",
        options: { showEffects: true, showEvents: true },
      });

      if (response.effects?.status?.status !== "success") {
        throw new Error(
          response.effects?.status?.error || "Transaction failed"
        );
      }

      toast.success(`Successfully swapped for ${tokenOut}`, { id: tokenOut });
      return { status: "success", digest: response.digest };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to swap: ${errorMsg}`, { id: tokenOut });
      return { status: "error", error: errorMsg };
    }
  };

  const buyBasket = async () => {
    if (!checkWallet()) return;

    setIsSwapping(true);
    setSwapResults([]);
    toast.loading("Starting basket purchase...", { id: "basket" });

    const tokenMap: Record<string, string> = {
      SUI: "0x2::sui::SUI",
      DEEP: "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
      NS: "0x5145494a5f5100e645e4b0aa950fa6b68f614e8c59e17bc5ded3495123a79178::ns::NS",
    };

    let success = true;
    for (let i = 0; i < basket.coins.length; i++) {
      const coin = basket.coins[i];
      const amount = (((investment * allocations[i]) / 100) * 1e6).toString(); 
      const result = await performSwap(tokenMap[coin.symbol], amount);
      setSwapResults((prev) => [...prev, result]);
      if (result.status === "error") success = false;
    }

    setIsSwapping(false);
    if (success) {
      toast.success("Successfully purchased basket!", { id: "basket" });
    } else {
      toast.error("Some swaps failed", { id: "basket" });
    }
  };

  const handleSliderChange = (newValue: number, index: number) => {
    const newAllocations = [...allocations];
    const diff = newValue - newAllocations[index];

    const remainingIndices = Array.from(
      { length: allocations.length },
      (_, i) => i
    ).filter((i) => i !== index);
    const totalRemaining = remainingIndices.reduce(
      (sum, i) => sum + newAllocations[i],
      0
    );

    remainingIndices.forEach((i) => {
      newAllocations[i] = Math.max(
        0,
        newAllocations[i] - (diff * newAllocations[i]) / totalRemaining
      );
    });

    newAllocations[index] = newValue;
    setAllocations(newAllocations);
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{basket.name}</DialogTitle>
        <DialogDescription>{basket.description}</DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        <div className="space-y-4">
          <h3 className="font-semibold">Investment Amount (USDC)</h3>
          <Slider
            value={[investment]}
            onValueChange={(value) => setInvestment(value[0])}
            max={1000}
            step={1}
            className="w-full"
          />
          <div className="text-right">{investment} USDC</div>
        </div>

        <div className="space-y-6">
          <h3 className="font-semibold">Allocations</h3>
          {basket.coins.map((coin, index) => (
            <div key={coin.symbol} className="space-y-2">
              <div className="flex justify-between">
                \ <span>{coin.symbol}</span>
                <span>{allocations[index].toFixed(1)}%</span>
              </div>
              <Slider
                value={[allocations[index]]}
                onValueChange={(value) => handleSliderChange(value[0], index)}
                max={100}
                step={0.1}
                className="w-full"
              />
              <div className="text-sm text-muted-foreground">
                ≈ {((investment * allocations[index]) / 100).toFixed(2)} SUI (
                {((investment * allocations[index]) / 100 / coin.price).toFixed(
                  2
                )}{" "}
                {coin.symbol})
              </div>
            </div>
          ))}
        </div>

        <Button className="w-full" onClick={buyBasket} disabled={isSwapping}>
          {isSwapping ? "Swapping..." : "Buy Basket"}
        </Button>

        {swapResults.length > 0 && (
          <div className="space-y-2 mt-4">
            <h4 className="font-semibold">Swap Results:</h4>
            {swapResults.map((result, index) => (
              <div
                key={index}
                className={`text-sm ${
                  result.status === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                Swap {index + 1}:{" "}
                {result.status === "success"
                  ? `Success (${result.digest?.slice(0, 8)}...)`
                  : `Failed - ${result.error}`}
              </div>
            ))}
          </div>
        )}
      </div>
    </DialogContent>
  );
};

export default function BasketsPage() {
  const [activeTab, setActiveTab] = useState("trending");

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="pb-10 pt-6">
        <PortfolioCard />
      </div>
      <Tabs
        defaultValue="trending"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="watchlist" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Watchlist
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending">
          <Dialog>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {baskets.map((basket) => (
                <BasketCard key={basket.id} basket={basket} />
              ))}
            </div>
            {baskets.map((basket) => (
              <BasketDialog key={basket.id} basket={basket} />
            ))}
          </Dialog>
        </TabsContent>

        <TabsContent value="watchlist">
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <ClipboardList className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Your Watchlist is Empty
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
              Start adding baskets to your watchlist to track their performance
              and get notified about updates.
            </p>
            <button
              onClick={() => setActiveTab("trending")}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Explore Trending Baskets
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
