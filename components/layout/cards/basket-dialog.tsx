"use client";
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buildTx, getQuote } from "@7kprotocol/sdk-ts";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Toaster, toast } from "sonner";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface Coin {
  name: string;
  symbol: string;
  percentage: number;
  price: number;
  iconUrl?: string;
}

interface Basket {
  id: string;
  name: string;
  coins: Coin[];
  description: string;
  cagr: string;
  score: string;
  creator?: string;
  type?: string;
}

interface SwapResult {
  status: "pending" | "success" | "error";
  digest?: string;
  error?: string;
}

interface BasketDialogProps {
  basket: Basket;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const USDC_ADDRESS =
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC";

const TOKEN_MAP: Record<string, string> = {
  SUI: "0x2::sui::SUI",
  DEEP: "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
  NS: "0x5145494a5f5100e645e4b0aa950fa6b68f614e8c59e17bc5ded3495123a79178::ns::NS",
};

const createConfetti = () => {
  const container = document.createElement("div");
  container.className = "confetti-container";
  document.body.appendChild(container);

  const colors = ["#00ff00", "#0099ff", "#ff0000", "#ffff00", "#ff00ff"];
  const shapes = ["square", "circle"];

  const confettiCount = 100;
  const confettiElements: HTMLDivElement[] = [];

  for (let i = 0; i < confettiCount; i++) {
    const element = document.createElement("div");
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    element.className = `confetti confetti--animation-${
      ["slow", "medium", "fast"][Math.floor(Math.random() * 3)]
    }`;

    element.style.cssText = `
      background-color: ${color};
      width: ${Math.random() * 10 + 5}px;
      height: ${Math.random() * 10 + 5}px;
      left: ${Math.random() * 100}vw;
      border-radius: ${shape === "circle" ? "50%" : "0"};
      transform: rotate(${Math.random() * 360}deg);
    `;

    confettiElements.push(element);
    container.appendChild(element);
  }

  setTimeout(() => {
    confettiElements.forEach((element: HTMLDivElement) => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }, 2500);
};

export const BasketDialog: React.FC<BasketDialogProps> = ({
  basket,
  isOpen,
  onOpenChange,
}) => {
  const [allocations, setAllocations] = useState(
    basket.coins.map((c) => c.percentage)
  );
  const [investment, setInvestment] = useState(100);
  const [swapResults, setSwapResults] = useState<SwapResult[]>([]);
  const [isSwapping, setIsSwapping] = useState(false);
  const rpcUrl = getFullnodeUrl("mainnet");
  const client = new SuiClient({ url: rpcUrl });

  const checkWallet = useCallback(() => {
    const wallet = localStorage.getItem("suiWallet");
    if (!wallet) {
      toast.error("Please connect your wallet first");
      return null;
    }
    try {
      return JSON.parse(wallet);
    } catch {
      toast.error("Invalid wallet data");
      return null;
    }
  }, []);

  const performSwap = async (
    tokenOut: string,
    amount: string
  ): Promise<SwapResult> => {
    const wallet = checkWallet();
    if (!wallet) return { status: "error", error: "No wallet connected" };

    try {
      const toastId = toast.loading(
        `Swapping ${amount} USDC for ${tokenOut}...`
      );

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

      toast.success("Swap successful!", { id: toastId });
      return { status: "success", digest: response.digest };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Swap failed: ${errorMsg}`);
      return { status: "error", error: errorMsg };
    }
  };

  const buyBasket = async () => {
    if (!checkWallet()) return;

    setIsSwapping(true);
    setSwapResults([]);

    const mainToastId = toast.loading("Starting basket purchase...");

    let success = true;
    for (let i = 0; i < basket.coins.length; i++) {
      const coin = basket.coins[i];
      const amount = (((investment * allocations[i]) / 100) * 1e6).toString();
      const result = await performSwap(TOKEN_MAP[coin.symbol], amount);
      setSwapResults((prev) => [...prev, result]);
      if (result.status === "error") success = false;
    }

    setIsSwapping(false);

    if (success) {
      toast.success("Basket purchased successfully! 🎉", { id: mainToastId });
      createConfetti();
    } else {
      toast.error("Some swaps failed. Please check the results below.", {
        id: mainToastId,
      });
    }
  };

  const handleSliderChange = useCallback((newValue: number, index: number) => {
    setAllocations((prevAllocations) => {
      const newAllocations = [...prevAllocations];
      const diff = newValue - newAllocations[index];

      const remainingIndices = Array.from(
        { length: newAllocations.length },
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
      return newAllocations;
    });
  }, []);

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "rgb(var(--background))",
            color: "rgb(var(--foreground))",
            border: "1px solid rgb(var(--border))",
          },
        }}
      />
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
            <div className="text-right font-medium">{investment} USDC</div>
          </div>

          <div className="space-y-6">
            <h3 className="font-semibold">Token Allocations</h3>
            {basket.coins.map((coin, index) => (
              <div key={coin.symbol} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {coin.iconUrl && (
                      <Image
                        src={coin.iconUrl}
                        alt={coin.name}
                        width={6}
                        height={6}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="font-medium">{coin.symbol}</span>
                  </div>
                  <span className="font-medium">
                    {allocations[index].toFixed(1)}%
                  </span>
                </div>
                <Slider
                  value={[allocations[index]]}
                  onValueChange={(value) => handleSliderChange(value[0], index)}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground">
                  ≈ {((investment * allocations[index]) / 100).toFixed(2)} USDC
                  (
                  {(
                    (investment * allocations[index]) /
                    100 /
                    coin.price
                  ).toFixed(2)}{" "}
                  {coin.symbol})
                </div>
              </div>
            ))}
          </div>

          <Button
            className="w-full relative overflow-hidden transition-all duration-300
              bg-gradient-to-r from-green-500 via-emerald-400 to-teal-400
              hover:from-green-400 hover:via-emerald-300 hover:to-teal-300
              disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={buyBasket}
            disabled={isSwapping}
          >
            {isSwapping ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              "Buy Basket"
            )}
          </Button>

          {swapResults.length > 0 && (
            <div className="space-y-2 mt-4 p-4 bg-background/5 rounded-lg border">
              <h4 className="font-semibold">Transaction Results:</h4>
              {swapResults.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2 rounded ${
                    result.status === "success"
                      ? "text-green-600 bg-green-50 dark:bg-green-900/10"
                      : "text-red-600 bg-red-50 dark:bg-red-900/10"
                  }`}
                >
                  <span>Token {index + 1}:</span>
                  <span>
                    {result.status === "success"
                      ? `Success (${result.digest?.slice(0, 8)}...)`
                      : `Failed - ${result.error}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </>
  );
};
