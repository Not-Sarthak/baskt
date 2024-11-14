import { useState } from "react";
import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const PortfolioCard = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Card className="w-full bg-white dark:bg-card shadow-lg rounded-2xl p-10">
      <CardContent className="p-0">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl text-gray-600 dark:text-gray-100">
            Your Portfolio
          </h2>
          <button
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            aria-label="Portfolio Information"
          >
            <Info size={18} />
            {showTooltip && (
              <div className="absolute mt-2 p-2 bg-card dark:bg-card border-[1px] dark:text-white text-sm rounded shadow-lg w-48">
                View your portfolio balance and performance metrics
              </div>
            )}
          </button>
        </div>
        <div className="flex items-center">
          <span className="text-4xl font-semibold text-gray-900 dark:text-white">
            $
          </span>
          <span className="text-5xl font-semibold text-gray-900 dark:text-white tracking-tight">
            0
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioCard;
