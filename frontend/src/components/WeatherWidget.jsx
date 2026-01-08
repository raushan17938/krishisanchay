import { Card } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, Wind, Droplets } from "lucide-react";
const WeatherWidget = ({
  data = {
    location: "\u0926\u093F\u0932\u094D\u0932\u0940",
    temperature: 28,
    condition: "partly-cloudy",
    humidity: 65,
    windSpeed: 12,
    rainfall: 2.5
  }
}) => {
  const getWeatherIcon = (condition) => {
    switch (condition) {
      case "sunny":
        return <Sun className="w-8 h-8" />;
      case "cloudy":
        return <Cloud className="w-8 h-8" />;
      case "rainy":
        return <CloudRain className="w-8 h-8" />;
      default:
        return <Sun className="w-8 h-8" />;
    }
  };
  return <Card className="weather-widget animate-fade-in">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">मौसम की जानकारी</h3>
          <p className="text-white/80">{data.location}</p>
        </div>
        <div className="text-white">
          {getWeatherIcon(data.condition)}
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="text-3xl font-bold text-white">
          {data.temperature}°C
        </div>
        <div className="text-right text-white/90">
          <p className="capitalize">{data.condition}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-white/90">
        <div className="flex flex-col items-center">
          <Droplets className="w-4 h-4 mb-1" />
          <span className="text-xs">नमी</span>
          <span className="text-sm font-semibold">{data.humidity}%</span>
        </div>
        
        <div className="flex flex-col items-center">
          <Wind className="w-4 h-4 mb-1" />
          <span className="text-xs">हवा</span>
          <span className="text-sm font-semibold">{data.windSpeed} km/h</span>
        </div>
        
        <div className="flex flex-col items-center">
          <CloudRain className="w-4 h-4 mb-1" />
          <span className="text-xs">बारिश</span>
          <span className="text-sm font-semibold">{data.rainfall} mm</span>
        </div>
      </div>
    </Card>;
};
var stdin_default = WeatherWidget;
export {
  stdin_default as default
};
