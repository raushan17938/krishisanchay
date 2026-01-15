import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, Wind, Droplets, MapPin, Loader2 } from "lucide-react";
import api from "@/api/axios";

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      try {
        let url = '/weather';
        if (lat && lon) {
          url += `?lat=${lat}&lon=${lon}`;
        }
        const response = await api.get(url);
        if (response.data.success) {
          setWeather(response.data.data);
        }
      } catch (err) {
        console.error("Weather fetch error:", err);
        setError("Failed to load weather");
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.warn("Location access denied, defaulting to Delhi");
          fetchWeather(); // Will fallback to default (Delhi) in backend
        }
      );
    } else {
      fetchWeather();
    }
  }, []);

  const getWeatherIcon = (condition) => {
    if (!condition) return <Sun className="w-8 h-8" />;
    const c = condition.toLowerCase();
    if (c.includes("rain") || c.includes("drizzle")) return <CloudRain className="w-8 h-8" />;
    if (c.includes("cloud")) return <Cloud className="w-8 h-8" />;
    if (c.includes("clear") || c.includes("sun")) return <Sun className="w-8 h-8" />;
    return <Cloud className="w-8 h-8" />;
  };

  const getWeatherStyles = (condition) => {
    if (!condition) return "from-blue-500 to-blue-600";
    const c = condition.toLowerCase();
    if (c.includes("rain") || c.includes("drizzle")) return "from-slate-700 to-slate-800";
    if (c.includes("cloud")) return "from-sky-400 to-sky-600";
    if (c.includes("clear") || c.includes("sun")) return "from-amber-400 to-orange-500";
    if (c.includes("fog") || c.includes("mist")) return "from-gray-400 to-gray-600";
    return "from-blue-500 to-blue-600";
  };

  const currentGradient = getWeatherStyles(weather?.condition);
  const conditionLower = weather?.condition?.toLowerCase() || "";

  // Animation Layers
  const RainAnimation = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute top-[-20px] bg-white/30 w-[1px] h-[30px] rounded-full animate-rain"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${0.5 + Math.random()}s`,
            animationDelay: `${Math.random()}s`
          }}
        />
      ))}
    </div>
  );

  const SunAnimation = () => (
    <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-yellow-300/20 rounded-full blur-3xl animate-sun-spin origin-center pointer-events-none" />
  );

  const CloudAnimation = () => (
    <div className="absolute top-10 right-10 pointer-events-none">
      <Cloud className="w-24 h-24 text-white/10 animate-cloud-drift blur-xl" />
      <Cloud className="w-32 h-32 text-white/5 absolute top-5 -left-10 animate-cloud-drift blur-2xl" style={{ animationDelay: '2s' }} />
    </div>
  );

  const FogAnimation = () => (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white/20 to-transparent animate-fog" />
      <div className="absolute bottom-0 left-0 w-full h-full bg-white/5 animate-fog" style={{ animationDelay: '2s' }} />
    </div>
  );

  if (loading) {
    return (
      <Card className="flex items-center justify-center min-h-[200px] bg-gradient-to-br from-gray-100 to-gray-200 border-none shadow-lg">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-base font-medium">Fetching local weather...</p>
        </div>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="flex items-center justify-center min-h-[200px] bg-red-50 border-red-100">
        <div className="text-center p-4">
          <CloudRain className="w-10 h-10 text-red-400 mx-auto mb-2" />
          <p className="text-red-600 font-medium">Weather data unavailable</p>
          <p className="text-red-400 text-sm mt-1">Please check your connection</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden border-none shadow-xl bg-gradient-to-br ${currentGradient} transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] relative`}>
      {/* Dynamic Background Animations */}
      {(conditionLower.includes("rain") || conditionLower.includes("drizzle")) && <RainAnimation />}
      {(conditionLower.includes("clear") || conditionLower.includes("sun")) && <SunAnimation />}
      {conditionLower.includes("cloud") && <CloudAnimation />}
      {(conditionLower.includes("fog") || conditionLower.includes("mist")) && <FogAnimation />}

      <div className="p-6 relative z-10">
        {/* Decorative background circle */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl opacity-50"></div>

        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Weather Update</h3>
            <div className="flex items-center gap-2 text-white/90 bg-white/20 px-3 py-1 rounded-full w-fit backdrop-blur-sm">
              <MapPin className="w-4 h-4" />
              <p className="text-sm font-medium">{weather.location}</p>
            </div>
          </div>
          <div className="text-white p-3 bg-white/20 rounded-2xl backdrop-blur-md shadow-sm">
            {getWeatherIcon(weather.condition)}
          </div>
        </div>

        <div className="flex items-end justify-between mb-8 relative z-10">
          <div>
            <div className="text-6xl font-bold text-white tracking-tighter drop-shadow-sm">
              {weather.temperature}°
            </div>
            <p className="text-lg text-white/90 font-medium mt-1 capitalize pl-1">
              {weather.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 relative z-10">
          <div className="flex flex-col items-center p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
            <Droplets className="w-5 h-5 mb-2 text-blue-100" />
            <span className="text-xs font-medium text-blue-50 uppercase tracking-wider">Humidity</span>
            <span className="text-lg font-bold text-white">{weather.humidity}%</span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
            <Wind className="w-5 h-5 mb-2 text-slate-100" />
            <span className="text-xs font-medium text-slate-50 uppercase tracking-wider">Wind</span>
            <span className="text-lg font-bold text-white">{weather.windSpeed} <span className="text-xs font-normal">km/h</span></span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
            <CloudRain className="w-5 h-5 mb-2 text-cyan-100" />
            {/* Fallback to 0 if rainfall is undefined */}
            <span className="text-xs font-medium text-cyan-50 uppercase tracking-wider">Rain</span>
            <span className="text-lg font-bold text-white">{typeof weather.rainfall === 'number' ? weather.rainfall : 0} <span className="text-xs font-normal">mm</span></span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WeatherWidget;
