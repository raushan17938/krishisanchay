import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
const MarketPrices = ({
  prices = [
    { crop: "Wheat", price: 2150, change: 2.5, unit: "per quintal" },
    { crop: "Paddy", price: 1850, change: -1.2, unit: "per quintal" },
    { crop: "Soybean", price: 4200, change: 4.8, unit: "per quintal" },
    { crop: "Maize", price: 1750, change: 0, unit: "per quintal" },
    { crop: "Chickpea", price: 5500, change: 3.2, unit: "per quintal" },
    { crop: "Mustard", price: 4800, change: -0.8, unit: "per quintal" }
  ]
}) => {
  const getTrendIcon = (change) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };
  const getTrendColor = (change) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-500";
  };
  return <Card className="price-card animate-fade-in">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-semibold text-accent-foreground">Market Prices</h3>
      <span className="text-sm text-accent-foreground/70">Delhi Mandi</span>
    </div>

    <div className="space-y-4">
      {prices.map((item, index) => <div
        key={item.crop}
        className="flex justify-between items-center py-3 border-b border-accent-foreground/20 last:border-b-0 animate-slide-up"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div>
          <p className="font-semibold text-accent-foreground">{item.crop}</p>
          <p className="text-sm text-accent-foreground/70">{item.unit}</p>
        </div>

        <div className="text-right">
          <p className="font-bold text-accent-foreground">₹{item.price.toLocaleString()}</p>
          <div className={`flex items-center justify-end gap-1 ${getTrendColor(item.change)}`}>
            {getTrendIcon(item.change)}
            <span className="text-sm font-semibold">
              {item.change > 0 && "+"}{item.change}%
            </span>
          </div>
        </div>
      </div>)}
    </div>

    <div className="mt-4 pt-4 border-t border-accent-foreground/20">
      <p className="text-xs text-accent-foreground/70 text-center">
        Last updated: 10 minutes ago
      </p>
    </div>
  </Card>;
};
var stdin_default = MarketPrices;
export {
  stdin_default as default
};
