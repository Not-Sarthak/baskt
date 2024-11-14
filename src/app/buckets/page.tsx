"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// import { Transaction } from "@mysten/sui/transactions";
import { buildTx, getQuote } from "@7kprotocol/sdk-ts";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import toast from "react-hot-toast";

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
}

interface SwapResult {
  status: "pending" | "success" | "error";
  digest?: string;
  error?: string;
}

const USDC_ADDRESS =
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC";

const baskets: Basket[] = [
  {
    id: "1",
    name: "Mysten Basket",
    description: "A balanced basket of Sui ecosystem tokens",
    coins: [
      { name: "Sui", symbol: "SUI", percentage: 33.33, price: 1.5 },
      { name: "Deep Book", symbol: "DEEP", percentage: 33.33, price: 0.8 },
      { name: "Navi Protocol", symbol: "NS", percentage: 33.34, price: 0.5 },
    ],
  },
  {
    id: "2",
    name: "DeFi Basket",
    description: "Top DeFi protocols in Sui",
    coins: [
      { name: "Sui", symbol: "SUI", percentage: 50, price: 1.5 },
      { name: "Deep Book", symbol: "DEEP", percentage: 25, price: 0.8 },
      { name: "Navi Protocol", symbol: "NS", percentage: 25, price: 0.5 },
    ],
  },
];

const BasketCard = ({ basket }: { basket: Basket }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{basket.name}</CardTitle>
        <CardDescription>{basket.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {basket.coins.map((coin) => (
            <div
              key={coin.symbol}
              className="flex justify-between items-center"
            >
              <span className="font-medium">{coin.symbol}</span>
              <span>{coin.percentage}%</span>
            </div>
          ))}
        </div>
        <DialogTrigger asChild>
          <Button className="w-full mt-4">View & Buy</Button>
        </DialogTrigger>
      </CardContent>
    </Card>
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
      const amount = (((investment * allocations[i]) / 100) * 1e6).toString(); // Changed to 1e6 for USDC decimals
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
                <span>{coin.symbol}</span>
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
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Investment Baskets</h1>
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
    </div>
  );
}
