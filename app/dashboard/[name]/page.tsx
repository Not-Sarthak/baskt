// app/dashboard/[name]/page.tsx
import { baskets } from "@/lib/bucket-data";
import { notFound } from "next/navigation";
import { ArrowLeft, Bookmark } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';

const PerformanceChart = dynamic(() => import('@/components/layout/charts/performance-chart'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full animate-pulse bg-gray-200 dark:bg-card rounded-lg" />
  ),
});

interface PageProps {
  params: {
    name: string;
  };
}

export default function BasketDetailPage({ params }: PageProps) {
  const basket = baskets.find(
    (b) => b.name.toLowerCase().replace(/\s+/g, '-') === params.name
  );

  if (!basket) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Mobile-friendly header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-card hover:bg-gray-200 dark:hover:bg-card/90 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
        </div>
        <Button variant="outline" className="rounded-full">
          Share on X
        </Button>
      </div>

      {/* Main content */}
      <div className="bg-white dark:bg-card rounded-3xl p-4 sm:p-6 mb-8">
        {/* Stack info header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
              <img 
                src="/icon-placeholder.png" 
                alt="Stack Icon" 
                className="w-8 h-8"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{basket.name}</h1>
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-200 rounded-full text-sm font-medium">
                  {basket.type}
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400">{basket.creator}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-8">
            <div className="text-right flex-1 lg:flex-none">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-gray-500 text-sm lg:text-base">Stack Score</span>
                <span className="text-xl lg:text-2xl font-bold text-green-500">{basket.score}</span>
              </div>
            </div>
            <div className="text-right flex-1 lg:flex-none">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-gray-500 text-sm lg:text-base">CAGR</span>
                <span className="text-xl lg:text-2xl font-bold text-green-500">{basket.cagr}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
              <Bookmark className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-2">About the {basket.name}</h2>
              <p className="text-gray-600 dark:text-gray-300">
                {basket.description}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Live Performance</h2>
              <PerformanceChart />
            </div>
          </div>

          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-col gap-4 sticky top-4">
              <Button size="lg" className="w-full bg-indigo-500 hover:bg-indigo-600">
                Instant Buy
              </Button>
              <Button size="lg" className="w-full bg-green-500 hover:bg-green-600">
                Safe Buy
              </Button>
              <Button size="lg" className="w-full bg-black hover:bg-gray-800">
                DCA Now
              </Button>
            </div>

            {/* Token Distribution */}
            <div className="bg-gray-50 dark:bg-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-6">Token Distribution</h3>
              <div className="space-y-6">
                {basket.coins.map((coin) => (
                  <div key={coin.symbol} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-card/80 rounded-full flex items-center justify-center">
                        {coin.iconUrl ? (
                          <img 
                            src={coin.iconUrl} 
                            alt={coin.name} 
                            className="w-6 h-6"
                          />
                        ) : (
                          <span className="text-sm font-medium">{coin.symbol[0]}</span>
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