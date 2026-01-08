import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WeatherWidget from "@/components/WeatherWidget";
import MarketPrices from "@/components/MarketPrices";
import {
  Mic,
  Camera,
  MessageCircle,
  ShoppingCart,
  Zap,
  Bell,
  User,
  Settings,
  Leaf,
  Briefcase
} from "lucide-react";
const FarmerDashboard = ({ onNavigate }) => {
  return <div className="min-h-screen bg-background">
      {
    /* Header */
  }
      <header className="bg-card shadow-soft border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-primary w-10 h-10 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Krishi Sanchay</h1>
                <p className="text-sm text-muted-foreground">Ram Kumar's Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">3</span>
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {
    /* Voice Assistant */
  }
        <Card className="farm-card mb-8 text-center">
          <div className="flex flex-col items-center">
            <div className="bg-gradient-primary w-20 h-20 rounded-full flex items-center justify-center mb-4 animate-bounce-soft">
              <Mic className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Ask AI Assistant</h2>
            <p className="text-muted-foreground mb-4">
              Ask "How's the weather?" or "What's the wheat price?"
            </p>
            <Button className="btn-farm">
              Ask with Voice
            </Button>
          </div>
        </Card>

        {
    /* Main Dashboard Grid */
  }
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {
    /* Left Column */
  }
          <div className="lg:col-span-2 space-y-6">
            {
    /* Weather & Prices Row */
  }
            <div className="grid md:grid-cols-2 gap-6">
              <WeatherWidget />
              <MarketPrices />
            </div>

            {
    /* Quick Actions */
  }
            <Card className="farm-card">
              <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Button
    className="btn-farm justify-start h-14"
    onClick={() => onNavigate("farmer-profile")}
  >
                  <User className="w-5 h-5 mr-3" />
                  My Profile
                </Button>
                <Button
    variant="outline"
    className="justify-start h-14 border-primary hover:bg-primary/10"
    onClick={() => onNavigate("land-management")}
  >
                  <Leaf className="w-5 h-5 mr-3" />
                  My Land
                </Button>
                <Button
    variant="outline"
    className="justify-start h-14 border-accent hover:bg-accent/10"
    onClick={() => onNavigate("product-management")}
  >
                  <ShoppingCart className="w-5 h-5 mr-3" />
                  My Products
                </Button>
                <Button
    variant="outline"
    className="justify-start h-14 border-secondary hover:bg-secondary/50"
    onClick={() => onNavigate("crop-doctor")}
  >
                  <Camera className="w-5 h-5 mr-3" />
                  Crop Doctor
                </Button>
                <Button
    variant="outline"
    className="justify-start h-14 border-orange-500 hover:bg-orange-500/10 text-orange-700 dark:text-orange-300"
    onClick={() => onNavigate("jobs-listing")}
  >
                  <Briefcase className="w-5 h-5 mr-3" />
                  Find Jobs
                </Button>
              </div>
            </Card>
          </div>

          {
    /* Right Column */
  }
          <div className="space-y-6">
            {
    /* Farm Stats */
  }
            <Card className="farm-card">
              <h3 className="text-lg font-semibold mb-4">Your Farm</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Land</span>
                  <span className="font-semibold">5.2 Acres</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current Crop</span>
                  <span className="font-semibold">Wheat</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Planting Date</span>
                  <span className="font-semibold">15 Nov 2024</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Expected Harvest</span>
                  <span className="font-semibold text-primary">20 Mar 2025</span>
                </div>
              </div>
            </Card>

            {
    /* Recent Activity */
  }
            <Card className="farm-card">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Received AI advice</p>
                    <p className="text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-accent/20 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    <Camera className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Uploaded crop photo</p>
                    <p className="text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-secondary/20 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Asked question in community</p>
                    <p className="text-muted-foreground">2 days ago</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>;
};
var stdin_default = FarmerDashboard;
export {
  stdin_default as default
};
