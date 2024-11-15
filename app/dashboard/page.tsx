"use client";
import React, { useState } from "react";
import {
  Card,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PortfolioCard from "@/components/layout/cards/portfolio-card";
import { ClipboardList, TrendingUp, Bookmark } from "lucide-react";
import { baskets } from "@/lib/bucket-data";
import Link from "next/link";
import { BasketDialog } from "@/components/layout/cards/basket-dialog";

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
