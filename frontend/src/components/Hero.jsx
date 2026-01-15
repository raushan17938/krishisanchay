import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Leaf,
  Users,
  TrendingUp,
  Shield,
  Star,
  ArrowRight,
  CheckCircle,
  Zap,
  Award,
  MessageCircle,
  Camera,
  Briefcase,
  ShoppingCart
} from "lucide-react";
import heroFarm from "@/assets/hero-farm.jpg";
import digitalFarming from "@/assets/digital-farming.jpg";

const Hero = ({ onNavigate }) => {
  // Smooth scroll function for internal sections
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return <div className="w-full bg-background overflow-x-hidden">
    {
      /* Hero Section */
    }
    <section id="hero" className="relative min-h-screen flex items-center justify-center py-12 lg:py-0">
      <div className="absolute inset-0 z-0">
        <img
          src={heroFarm}
          alt="Indian farmers working in agricultural fields"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-white">
        {
          /* Floating Badge */
        }
        <Badge className="mb-6 inline-flex items-center bg-white/20 text-white border-white/30 animate-bounce-soft px-4 py-2 text-sm sm:text-base">
          <Star size={16} strokeWidth={2} color="currentColor" className="mr-2" />
          India's #1 Agriculture Platform
        </Badge>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 leading-tight animate-fade-in px-4">
          <span className="bg-gradient-to-r from-green-400 via-green-300 to-green-500 bg-clip-text text-transparent drop-shadow-2xl">
            Krishi Sanchay
          </span>
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-3 sm:mb-4 max-w-4xl mx-auto leading-relaxed font-medium animate-slide-up px-4">
          A Comprehensive Platform for Indian Farmers
        </p>

        <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-10 lg:mb-12 max-w-3xl mx-auto text-white/90 animate-slide-up [animation-delay:200ms] px-4">
          Modern farming, market insights, AI assistance, and farmer community - all in one place
        </p>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16 animate-slide-up [animation-delay:400ms] px-4">
          <Button
            onClick={() => onNavigate && onNavigate('dashboard')}
            className="btn-farm text-lg sm:text-xl px-8 sm:px-10 py-4 sm:py-5 shadow-2xl w-full sm:w-auto cursor-pointer hover:scale-105 transition-transform">
            <Zap size={20} strokeWidth={2.5} color="currentColor" className="mr-2 sm:mr-3" />
            Get Started Now
            <ArrowRight size={18} strokeWidth={2} color="currentColor" className="ml-2 sm:ml-3" />
          </Button>
          <Button
            onClick={() => onNavigate && onNavigate('community')}
            variant="ghost"
            className="text-white border-2 border-white hover:bg-white hover:text-primary text-lg sm:text-xl px-8 sm:px-10 py-4 sm:py-5 w-full sm:w-auto cursor-pointer hover:scale-105 transition-transform">
            <Users size={20} strokeWidth={2} color="currentColor" className="mr-2 sm:mr-3" />
            Join Community
          </Button>
        </div>

        {
          /* Stats */
        }
        <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-2xl mx-auto animate-fade-in [animation-delay:600ms] px-4">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-300 mb-2">50K+</div>
            <div className="text-sm sm:text-base text-white/80">Farmers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-300 mb-2">1000+</div>
            <div className="text-sm sm:text-base text-white/80">Shopkeepers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-300 mb-2">24/7</div>
            <div className="text-sm sm:text-base text-white/80">Support</div>
          </div>
        </div>
      </div>

      {
        /* Animated Elements */
      }
      <div className="absolute top-20 left-10 w-4 h-4 bg-green-400 rounded-full animate-bounce-soft opacity-70" />
      <div className="absolute top-40 right-20 w-6 h-6 bg-yellow-400 rounded-full animate-bounce-soft [animation-delay:500ms] opacity-70" />
      <div className="absolute bottom-40 left-20 w-3 h-3 bg-blue-400 rounded-full animate-bounce-soft [animation-delay:1000ms] opacity-70" />
    </section>

    {
      /* Features Section */
    }
    <section id="features" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-muted/30 to-background relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <Badge className="mb-4 sm:mb-6 inline-flex items-center bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm sm:text-base">
            <Award size={16} strokeWidth={2} color="currentColor" className="mr-2" />
            Key Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent px-4 py-4">
            Your Farming, Our Technology
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Combining modern technology with traditional wisdom
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 lg:mb-20">
          {/* Feature 1: AI Advisor */}
          <Card
            onClick={() => onNavigate && onNavigate('ai-advisor')}
            className="farm-card text-center group hover:-translate-y-4 animate-slide-up cursor-pointer p-6">
            <div className="bg-gradient-primary w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-green-200">
              <MessageCircle size={40} strokeWidth={2} color="white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">AI Kisan Advisor</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Your personal farming expert. Ask questions in your language and get instant advice.
            </p>
            <div className="flex justify-center text-primary font-medium group-hover:gap-2 transition-all items-center">
              <span>Ask Now</span>
              <ArrowRight size={18} className="ml-1" />
            </div>
          </Card>

          {/* Feature 2: Crop Doctor */}
          <Card
            onClick={() => onNavigate && onNavigate('crop-doctor')}
            className="farm-card text-center group hover:-translate-y-4 animate-slide-up [animation-delay:100ms] cursor-pointer p-6">
            <div className="bg-gradient-earth w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-orange-200">
              <Camera size={40} strokeWidth={2} color="white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Crop Doctor</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Take a photo of your sick crop and get instant diagnosis and treatment solutions.
            </p>
            <div className="flex justify-center text-orange-600 font-medium group-hover:gap-2 transition-all items-center">
              <span>Diagnose</span>
              <ArrowRight size={18} className="ml-1" />
            </div>
          </Card>

          {/* Feature 3: Job Portal */}
          <Card
            onClick={() => onNavigate && onNavigate('jobs-listing')}
            className="farm-card text-center group hover:-translate-y-4 animate-slide-up [animation-delay:200ms] cursor-pointer p-6">
            <div className="bg-gradient-sky w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-200">
              <Briefcase size={40} strokeWidth={2} color="white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Krishi Jobs</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Find agricultural work or hire skilled labor for your farm. Connect locally.
            </p>
            <div className="flex justify-center text-blue-600 font-medium group-hover:gap-2 transition-all items-center">
              <span>Find Work</span>
              <ArrowRight size={18} className="ml-1" />
            </div>
          </Card>

          {/* Feature 4: Land Rental */}
          <Card
            onClick={() => onNavigate && onNavigate('land-rental')}
            className="farm-card text-center group hover:-translate-y-4 animate-slide-up [animation-delay:300ms] cursor-pointer p-6">
            <div className="bg-gradient-harvest w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-yellow-200">
              <Leaf size={40} strokeWidth={2} color="white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Land Exchange</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Lease land or rent equipment securely. Expand your farming capacity.
            </p>
            <div className="flex justify-center text-yellow-600 font-medium group-hover:gap-2 transition-all items-center">
              <span>Explore Land</span>
              <ArrowRight size={18} className="ml-1" />
            </div>
          </Card>

          {/* Feature 5: Marketplace */}
          <Card
            onClick={() => onNavigate && onNavigate('shop')}
            className="farm-card text-center group hover:-translate-y-4 animate-slide-up [animation-delay:400ms] cursor-pointer p-6">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-purple-200">
              <ShoppingCart size={40} strokeWidth={2} color="white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Marketplace</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Buy seeds, fertilizers, and tools. Sell your harvest directly to buyers.
            </p>
            <div className="flex justify-center text-purple-600 font-medium group-hover:gap-2 transition-all items-center">
              <span>Shop Now</span>
              <ArrowRight size={18} className="ml-1" />
            </div>
          </Card>

          {/* Feature 6: Community */}
          <Card
            onClick={() => onNavigate && onNavigate('community')}
            className="farm-card text-center group hover:-translate-y-4 animate-slide-up [animation-delay:500ms] cursor-pointer p-6">
            <div className="bg-gradient-to-br from-pink-500 to-rose-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-pink-200">
              <Users size={40} strokeWidth={2} color="white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Farmer Community</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Join the discussion. Share tips, ask advice, and connect with 50K+ farmers.
            </p>
            <div className="flex justify-center text-rose-600 font-medium group-hover:gap-2 transition-all items-center">
              <span>Join Discussion</span>
              <ArrowRight size={18} className="ml-1" />
            </div>
          </Card>
        </div>

        {
          /* Success Stories */
        }
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center" id="success-stories">
          <div className="animate-fade-in px-4 sm:px-0">
            <Badge className="mb-4 sm:mb-6 inline-flex items-center bg-green-100 text-green-700 border-green-200 px-4 py-2 text-sm sm:text-base">
              <CheckCircle size={16} strokeWidth={2} color="currentColor" className="mr-2" />
              Success Stories
            </Badge>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
              Trusted by Thousands of Farmers
            </h3>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Farmers across the country are using Krishi Sanchay to increase their income and practice modern farming.
            </p>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle size={22} strokeWidth={2} color="#22c55e" className="flex-shrink-0" />
                <span className="text-base sm:text-lg">Up to 40% yield increase</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={22} strokeWidth={2} color="#22c55e" className="flex-shrink-0" />
                <span className="text-base sm:text-lg">25% cost reduction</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={22} strokeWidth={2} color="#22c55e" className="flex-shrink-0" />
                <span className="text-base sm:text-lg">99% accurate disease detection</span>
              </div>
            </div>
          </div>

          <div className="relative animate-slide-up [animation-delay:400ms] px-4 sm:px-0">
            <img
              src={digitalFarming}
              alt="Digital farming technology"
              className="rounded-2xl sm:rounded-3xl shadow-2xl w-full"
            />
            <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-gradient-primary text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-glow">
              <div className="text-2xl sm:text-3xl font-bold">₹15L+</div>
              <div className="text-xs sm:text-sm opacity-90">Average Annual Savings</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {
      /* Nearby Farmers Section */
    }
    <section id="farmers" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-14 lg:mb-16">
          <Badge className="mb-4 sm:mb-6 inline-flex items-center bg-blue-100 text-blue-700 border-blue-200 px-4 py-2 text-sm sm:text-base">
            <Users size={16} strokeWidth={2} color="currentColor" className="mr-2" />
            Trusted Community
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent px-4">
            Meet Farmers Near You
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Connect with experienced farmers in your area and learn about successful crops
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-14 lg:mb-16">
          {
            /* Farmer 1 */
          }
          <Card className="farm-card overflow-hidden group hover:-translate-y-2 transition-transform">
            <div className="aspect-video bg-gradient-earth rounded-t-lg flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400"
                alt="Wheat farming"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">RK</span>
                </div>
                <div>
                  <h3 className="font-bold">Rajesh Kumar</h3>
                  <p className="text-sm text-muted-foreground">Bagpat, UP • 5 acres</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm text-primary mb-2">Successful Crops:</h4>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">Wheat</Badge>
                    <Badge variant="secondary" className="text-xs">Rice</Badge>
                    <Badge variant="secondary" className="text-xs">Maize</Badge>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">"40% increase in yield using modern techniques"</p>
                </div>
              </div>
            </div>
          </Card>

          {
            /* Farmer 2 */
          }
          <Card className="farm-card overflow-hidden group hover:-translate-y-2 transition-transform">
            <div className="aspect-video bg-gradient-sky rounded-t-lg flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400"
                alt="Organic farming"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-earth rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">SD</span>
                </div>
                <div>
                  <h3 className="font-bold">Sunita Devi</h3>
                  <p className="text-sm text-muted-foreground">Meerut, UP • 3 acres</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm text-primary mb-2">Successful Crops:</h4>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">Mustard</Badge>
                    <Badge variant="secondary" className="text-xs">Potato</Badge>
                    <Badge variant="secondary" className="text-xs">Peas</Badge>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">"Organic farming reduced costs by 25%"</p>
                </div>
              </div>
            </div>
          </Card>

          {
            /* Farmer 3 */
          }
          <Card className="farm-card overflow-hidden group hover:-translate-y-2 transition-transform">
            <div className="aspect-video bg-gradient-harvest rounded-t-lg flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400"
                alt="Sugarcane farming"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-harvest rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">AS</span>
                </div>
                <div>
                  <h3 className="font-bold">Amit Sharma</h3>
                  <p className="text-sm text-muted-foreground">Ghaziabad, UP • 8 acres</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm text-primary mb-2">Successful Crops:</h4>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">Sugarcane</Badge>
                    <Badge variant="secondary" className="text-xs">Rice</Badge>
                    <Badge variant="secondary" className="text-xs">Vegetables</Badge>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">"Smart irrigation saved 60% water"</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="text-center">
          <Button
            onClick={() => onNavigate && onNavigate('land-rental')}
            className="btn-farm text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto cursor-pointer hover:scale-105 transition-transform">
            Connect with More Farmers
            <Users size={18} strokeWidth={2} color="currentColor" className="ml-2 sm:ml-3" />
          </Button>
        </div>
      </div>
    </section>

    {
      /* CTA Section */
    }
    <section
      id="cta"
      className="py-20 sm:py-24 lg:py-32 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, hsl(120, 65%, 25%), hsl(120, 65%, 35%))'
      }}
    >
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8 animate-fade-in px-4">
          Start Today
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-8 sm:mb-10 lg:mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up px-4">
          Join us in the modern farming journey and increase your income
        </p>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center animate-slide-up [animation-delay:200ms] px-4">
          <Button
            onClick={() => onNavigate && onNavigate('dashboard')}
            className="bg-white text-primary hover:bg-gray-100 text-lg sm:text-xl px-8 sm:px-10 py-4 sm:py-5 shadow-2xl w-full sm:w-auto cursor-pointer hover:scale-105 transition-transform">
            <Zap size={20} strokeWidth={2.5} color="currentColor" className="mr-2 sm:mr-3" />
            Start Free Now
          </Button>
          <Button
            onClick={() => scrollToSection('features')}
            variant="ghost"
            className="text-white border-2 border-white/50 hover:bg-white/10 text-lg sm:text-xl px-8 sm:px-10 py-4 sm:py-5 w-full sm:w-auto cursor-pointer hover:scale-105 transition-transform">
            Watch Demo
          </Button>
        </div>
      </div>

      {
        /* Floating Elements */
      }
      <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white/20 rounded-full animate-bounce-soft" />
      <div className="absolute bottom-10 right-10 w-16 h-16 border-2 border-white/20 rounded-full animate-bounce-soft [animation-delay:1000ms]" />
      <div className="absolute top-1/2 right-20 w-12 h-12 border-2 border-white/20 rounded-full animate-bounce-soft [animation-delay:500ms]" />
    </section>
  </div>;
};
var stdin_default = Hero;
export {
  stdin_default as default
};
