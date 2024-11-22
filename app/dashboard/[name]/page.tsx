"use client";
import { baskets } from "@/lib/bucket-data";
import { notFound } from "next/navigation";
import { ArrowLeft, Bookmark } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { useState, useCallback, useEffect } from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { BasketDialog } from "@/components/layout/cards/basket-dialog";
import {
  coinWithBalance,
  Transaction,
  TransactionObjectArgument,
} from "@mysten/sui/transactions";
import { buildTx, getQuote } from "@7kprotocol/sdk-ts";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import {
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { toast } from "sonner";

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

const PerformanceChart = dynamic(
  () => import("@/components/layout/charts/performance-chart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full animate-pulse bg-gray-200 dark:bg-card rounded-lg" />
    ),
  }
);

interface PageProps {
  params: {
    name: string;
  };
}

export default function BasketDetailPage({ params }: PageProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [digest, setDigest] = useState("");
  const currentAccount = useCurrentAccount();

  const basket = baskets.find(
    (b) => b.name.toLowerCase().replace(/\s+/g, "-") === params.name
  );

  if (!basket) {
    notFound();
  }
  const USDC_TYPE =
    "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC";
  const multiBuy = async () => {
    try {
      const client = new SuiClient({ url: getFullnodeUrl("mainnet") });
      let txb = new Transaction();

      // Split coins with proper amounts
      let [part1, part2, part3] = txb.splitCoins(
        txb.gas,
        [100000000, 300000000, 200000000]
      );

      const quoteParams = [
        {
          tokenIn: "0x2::sui::SUI",
          tokenOut:
            "0xd0e89b2af5e4910726fbcd8b8dd37bb79b29e5f83f7491bca830e94f7f226d29::eth::ETH",
          // tokenOut:
          //   "0x76cb819b01abed502bee8a702b4c2d547532c12f25001c9dea795a5e631c26f1::fud::FUD",
          amountIn: "100000000",
        },
        {
          tokenIn: "0x2::sui::SUI",
          tokenOut:
            "0x7016aae72cfc67f2fadf55769c0a7dd54291a583b63051a5ed71081cce836ac6::sca::SCA",
          amountIn: "300000000",
        },
        {
          tokenIn: "0x2::sui::SUI",
          tokenOut:
            "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
          amountIn: "200000000",
        },
      ];

      // Fetch quotes concurrently
      const [quote1, quote2, quote3] = await Promise.all(
        quoteParams.map((params) => getQuote(params))
      );

      const commonParams = {
        accountAddress:
          "0x9d655392521726d0eb26915670f7a37fe78b6fe001d133280ddaf57e4428aae1",
        slippage: 0.01,
        commission: {
          partner:
            "0x89960536d44ae8078f08aa442c0aa3081c0cf21b6bcca5597951f1671642af75",
          commissionBps: 0,
        },
      };

      // First swap
      let { tx: extendTx1, coinOut: coinOut1 } = await buildTx({
        quoteResponse: quote1,
        extendTx: { tx: txb, coinIn: part1 },
        ...commonParams,
      });

      // Second swap
      let { tx: extendTx2, coinOut: coinOut2 } = await buildTx({
        quoteResponse: quote2,
        extendTx: { tx: extendTx1, coinIn: part2 },
        ...commonParams,
      });

      // Third swap
      let { tx: finalTx, coinOut: coinOut3 } = await buildTx({
        quoteResponse: quote3,
        extendTx: { tx: extendTx2, coinIn: part3 },
        ...commonParams,
      });

      // Handle coin outputs
      if (coinOut1 && coinOut2 && coinOut3) {
        // Transfer swapped tokens to user
        finalTx.transferObjects(
          [coinOut1, coinOut2, coinOut3],
          commonParams.accountAddress
        );

        // Transfer potentially remaining coins back to user
        finalTx.transferObjects(
          [part1, part2, part3].filter(Boolean),
          commonParams.accountAddress
        );
      } else {
        throw new Error("One or more coin outputs are undefined");
      }

      // Set gas budget and execute
      finalTx.setGasBudget(100000000);

      const response = await signAndExecuteTransaction(
        {
          transaction: finalTx,
          chain: "sui:mainnet",
        },

        {
          onSuccess: (result) => {
            console.log("executed transaction", result);
            setDigest(result.digest);
          },
        }
      );

      return response;
    } catch (err) {
      console.error("Transaction failed:", err);
      throw err;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex px-10 justify-between gap-4 mb-8 pt-10">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-card hover:bg-gray-200 dark:hover:bg-card/90 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 hover:-translate-x-1 hover:transition-all" />
            <span className="hidden sm:inline">Back</span>
          </Link>
        </div>
        <Button variant="outline" className="rounded-full">
          Share on X
        </Button>
      </div>

      <div className="rounded-3xl p-4 sm:p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 bg-card px-10 py-10 rounded-2xl shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
              <Image
                src="/icon-placeholder.png"
                alt="Stack Icon"
                width={30}
                height={30}
              />
            </div>
            <div className="">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl">{basket.name}</h1>
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-200 rounded-full text-sm font-medium">
                  {basket.type}
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                {basket.creator}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:gap-8">
            <div className="text-right flex-1 lg:flex-none">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-gray-500 text-sm lg:text-base">
                  Stack Score
                </span>
                <span className="text-xl lg:text-xl text-green-500">
                  {basket.score}
                </span>
              </div>
            </div>
            <div className="text-right flex-1 lg:flex-none">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-gray-500 text-sm lg:text-base">CAGR</span>
                <span className="text-xl lg:text-xl text-green-500">
                  {basket.cagr}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8 bg-gray-50 dark:bg-card rounded-2xl p-10">
            <div>
              <h2 className="font-semibold mb-2">Description {basket.name}</h2>
              <p className="text-gray-600 dark:text-gray-300">
                {basket.description}
              </p>
            </div>

            <div>
              <h2 className="font-semibold mb-4">Live Performance</h2>
              <PerformanceChart />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-4 sticky top-4">
              <Button
                size="lg"
                className="w-full relative overflow-hidden transition-all duration-300 
                bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-400
                hover:scale-[1.02] hover:shadow-lg hover:from-indigo-500 hover:via-blue-400 hover:to-indigo-300
                active:scale-[0.98]"
                onClick={multiBuy}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">Instant Buy</span>
              </Button>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="w-full relative overflow-hidden transition-all duration-300
                      bg-gradient-to-r from-green-500 via-emerald-400 to-teal-400
                      hover:scale-[1.02] hover:shadow-lg hover:from-green-400 hover:via-emerald-300 hover:to-teal-300
                      active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10">Safe Buy</span>
                  </Button>
                </DialogTrigger>
                <BasketDialog
                  basket={basket}
                  isOpen={dialogOpen}
                  onOpenChange={setDialogOpen}
                />
              </Dialog>
            </div>

            <div className="bg-gray-50 dark:bg-card rounded-2xl p-6">
              <h3 className="font-semibold mb-3">Token Distribution</h3>
              <div className="space-y-6">
                {basket.coins.map((coin) => (
                  <div
                    key={coin.symbol}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-card rounded-full flex items-center justify-center">
                        {coin.iconUrl ? (
                          <Image
                            src={coin.iconUrl}
                            alt={coin.name}
                            width={6}
                            height={6}
                            className="w-6 h-6"
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {coin.symbol[0]}
                          </span>
                        )}
                      </div>
                      <span className="font-medium">{coin.symbol}</span>
                    </div>
                    <span className="font-semibold">{coin.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
