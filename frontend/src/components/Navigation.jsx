import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Users,
  ShoppingCart,
  Camera,
  MessageCircle,
  TrendingUp,
  Leaf,
  Menu,
  X,
  Briefcase,
  LogIn
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { logoutUser } from "../api/auth";
import { toast } from "sonner";

import { getMe } from "../api/auth";

const Navigation = ({ currentView, setCurrentView }) => {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('userInfo');

      // Optimistically set from local storage first for speed
      if (userInfo) {
        try {
          setUser(JSON.parse(userInfo));
        } catch (e) {
          console.error("Error parsing user info", e);
        }
      }

      if (token) {
        try {
          const response = await getMe();
          if (response.success) {
            setUser(response.data);
            localStorage.setItem('userInfo', JSON.stringify(response.data));
          }
        } catch (error) {
          console.error("Failed to fetch fresh user info", error);
          // If unauthorized (401), maybe clear user? 
          // For now, let interceptor handle 401s or just fallback to what we have
        }
      } else {
        setUser(null);
      }
    };

    checkUser();

    // Listen for storage events (optional for multi-tab, but good practice)
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, [currentView]); // Re-check on view change for simple refresh behavior

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error(error);
    }
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    setUser(null);
    setCurrentView('hero'); // Force view change to unmount protected components
    navigate('/');
    toast.success("Logged out successfully");
  };

  const navItems = [
    { id: "hero", label: t('nav.home'), icon: Home },
    { id: "dashboard", label: t('nav.dashboard'), icon: TrendingUp },
    { id: "land-rental", label: t('nav.landRental'), icon: Users },
    { id: "jobs-listing", label: t('nav.jobs'), icon: Briefcase },
    { id: "community", label: t('nav.community'), icon: Users },
    { id: "shop", label: t('nav.shop'), icon: ShoppingCart },
    { id: "crop-doctor", label: t('nav.cropDoctor'), icon: Camera },
    { id: "ai-advisor", label: t('nav.aiAdvisor'), icon: MessageCircle }
  ];
  return <>
    {
      /* Desktop Navigation */
    }
    <nav className="hidden lg:flex fixed top-6 inset-x-0 justify-center z-50 pointer-events-none">
      <div className="bg-white/90 backdrop-blur-xl border border-border/50 rounded-2xl shadow-glow px-4 py-2 flex items-center justify-between pointer-events-auto w-[95%] xl:w-[99%] max-w-7xl">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-primary w-10 h-10 rounded-full flex items-center justify-center">
            <Leaf size={24} strokeWidth={2} color="white" />
          </div>
          <span className="font-bold hidden xl:block text-lg text-foreground">Krishi Sanchay</span>
        </div>

        <div className="flex items-center gap-0.5 xl:gap-1 2xl:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`transition-all duration-200 h-10 lg:px-1 xl:px-3 2xl:px-4 ${isActive ? "bg-gradient-primary text-white shadow-glow" : "text-gray-800 hover:bg-primary/10 hover:text-primary"}`}
              onClick={() => setCurrentView(item.id)}
            >
              <Icon size={16} strokeWidth={2.5} color="currentColor" className="mr-2" />
              <span className="font-medium lg:text-xs xl:text-sm">{item.label}</span>
            </Button>;
          })}
        </div>

        <div className="flex items-center gap-3 lg:ml-2 lg:pl-2 xl:ml-4 xl:pl-4 border-l border-gray-200">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border border-primary/20">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setCurrentView('dashboard')}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentView('farmer-profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button className="rounded-full bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all h-10 lg:px-3 xl:px-6">
                <LogIn size={16} className="mr-2" />
                {t('nav.login')}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>

    {
      /* Mobile Navigation */
    }
    <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-primary w-8 h-8 rounded-full flex items-center justify-center">
              <Leaf size={20} strokeWidth={2} color="white" />
            </div>
            <span className="font-bold text-foreground">Krishi Sanchay</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} strokeWidth={2} color="currentColor" /> : <Menu size={24} strokeWidth={2} color="currentColor" />}
          </Button>
        </div>

        {isMobileMenuOpen && <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-border/50 py-6 animate-fade-in">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 gap-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return <Button
                  key={item.id}
                  variant={isActive ? "default" : "outline"}
                  className={`justify-start h-12 font-medium ${isActive ? "bg-gradient-primary text-white" : "text-gray-800 hover:bg-primary/10 hover:text-primary hover:border-primary"}`}
                  onClick={() => {
                    setCurrentView(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Icon size={18} strokeWidth={2.5} color="currentColor" className="mr-2" />
                  {item.label}
                </Button>;
              })}

              {user ? (
                <Button className="col-span-2 mt-2 w-full h-12 bg-red-50 text-red-600 hover:bg-red-100 border-red-200" variant="outline" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                  <LogIn size={18} className="mr-2 rotate-180" />
                  Logout
                </Button>
              ) : (
                <Link to="/login" className="col-span-2 mt-2">
                  <Button className="w-full h-12 bg-primary text-white hover:bg-primary/90 shadow-lg" onClick={() => setIsMobileMenuOpen(false)}>
                    <LogIn size={18} className="mr-2" />
                    {t('nav.loginSignup')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>}
      </div>
    </nav>

    {
      /* Mobile Bottom Navigation */
    }
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-border/50">
      <div className="grid grid-cols-4 gap-1 p-2">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return <Button
            key={item.id}
            variant="ghost"
            className={`flex-col h-16 p-2 transition-all ${isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/5"}`}
            onClick={() => setCurrentView(item.id)}
          >
            <Icon size={20} strokeWidth={2} color="currentColor" className="mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
            {isActive && <div className="w-1 h-1 bg-primary rounded-full mt-1" />}
          </Button>;
        })}
      </div>
    </div>
  </>;
};
var stdin_default = Navigation;
export {
  stdin_default as default
};
