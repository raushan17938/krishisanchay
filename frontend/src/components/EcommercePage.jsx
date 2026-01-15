import { Card } from "@/components/ui/card";
import { CheckoutDialog } from "./CheckoutDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import {
  ShoppingCart,
  Search,
  Filter,
  Star,
  MapPin,
  Heart,
  Trash2,
  Plus,
  Minus
} from "lucide-react";
import { getProducts } from "../api/product";
import { toggleWishlistService, getWishlistService } from "../api/auth";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const EcommercePage = () => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        toast.info("Item quantity updated");
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      toast.success("Added to cart!");
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
    toast.success("Removed from cart");
  };

  const updateQuantity = (productId, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedProductIds, setLikedProductIds] = useState(new Set());
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [featureFilters, setFeatureFilters] = useState({
    fastDelivery: false,
    organic: false,
    inStock: false
  });

  const handleCheckoutSuccess = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    toast.success("Order placed successfully!");
  };

  // Fetch products and wishlist on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, wishlistData] = await Promise.all([
          getProducts(),
          getWishlistService().catch(err => ({ success: false, data: [] })) // Handle non-logged in users gracefully
        ]);

        if (productsData.success) {
          setProducts(productsData.data.map(p => ({
            id: p._id,
            name: p.name,
            category: p.category, // Added category for filtering
            price: p.price,
            originalPrice: p.price * 1.1, // Mock original price for now
            rating: p.rating || 4.5,
            reviews: p.numReviews || 0,
            seller: p.seller?.name || "Unknown Seller",
            location: "India", // Placeholder location
            image: p.image || "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=300",
            inStock: p.countInStock > 0,
            fastDelivery: true,
            organic: p.category === 'Organic'
          })));
        }

        if (wishlistData && wishlistData.success) {
          // wishlistData.data is array of product objects or IDs depending on populate?
          // Controller does populate('wishlist'), so it's objects.
          // We just need IDs for the Set
          const ids = new Set(wishlistData.data.map(item => item._id || item));
          setLikedProductIds(ids);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLike = async (productId) => {
    // ... (keep handleLike logic same) ...
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Please login to like products");
      return;
    }

    const isLiked = likedProductIds.has(productId);
    const newLikedIds = new Set(likedProductIds);
    if (isLiked) {
      newLikedIds.delete(productId);
      toast.info("Removed from wishlist");
    } else {
      newLikedIds.add(productId);
      toast.success("Added to wishlist");
    }
    setLikedProductIds(newLikedIds);

    try {
      await toggleWishlistService(productId);
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error("Failed to update wishlist");
      setLikedProductIds(likedProductIds);
    }
  };

  const categories = [
    { name: "All", count: 0, icon: "\u221E" }, // Added All option
    { name: "Seeds", count: 234, icon: "\u{1F331}" },
    { name: "Fertilizers", count: 156, icon: "\u{1F33F}" },
    { name: "Pesticides", count: 89, icon: "\u{1F6E1}\uFE0F" },
    { name: "Tools", count: 145, icon: "\u2692\uFE0F" },
    { name: "Irrigation", count: 67, icon: "\u{1F4A7}" },
    { name: "Machinery", count: 23, icon: "\u{1F69C}" }
  ];

  // Filtering Logic
  const filteredProducts = products.filter(product => {
    // 1. Search Query
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // 2. Category
    if (selectedCategory && product.category !== selectedCategory) {
      return false;
    }

    // 3. Wishlist Only
    if (showWishlistOnly && !likedProductIds.has(product.id)) return false;

    // 4. Price Range
    const min = parseFloat(priceRange.min) || 0;
    const max = parseFloat(priceRange.max) || Infinity;
    if (product.price < min || product.price > max) return false;

    // 5. Features
    if (featureFilters.fastDelivery && !product.fastDelivery) return false;
    if (featureFilters.organic && !product.organic) return false;
    if (featureFilters.inStock && !product.inStock) return false;

    return true;
  });


  return <div className="min-h-screen bg-background pt-20 lg:pt-8">
    <div className="container mx-auto px-6 py-8">
      {/* ... Header ... */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Agricultural Shop
          </h1>
          <p className="text-xl text-muted-foreground">
            Quality agricultural products directly for farmers
          </p>
        </div>

        <Button
          className={`btn-farm relative ${showWishlistOnly ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
          variant={showWishlistOnly ? "default" : "outline"}
          onClick={() => setShowWishlistOnly(!showWishlistOnly)}
        >
          <Heart className={`w-5 h-5 mr-2 ${showWishlistOnly ? 'fill-current' : ''}`} />
          {showWishlistOnly ? "Likeds" : "Liked Items"}
        </Button>

        {/* ... Cart Sheet ... */}
        <Sheet>
          <SheetTrigger asChild>
            <Button className="btn-farm relative">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart
              {cartItemCount > 0 && <Badge className="absolute -top-2 -right-2 bg-red-500 text-white min-w-[1.5rem] h-6 rounded-full flex items-center justify-center text-xs">
                {cartItemCount}
              </Badge>}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:w-[540px] flex flex-col">
            <SheetHeader>
              <SheetTitle>Shopping Cart ({cartItemCount} items)</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto py-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border rounded-lg bg-card/50">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold line-clamp-2">{item.name}</h4>
                        <p className="text-primary font-bold mt-1">₹{item.price.toLocaleString()}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-4 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                        className="self-start text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cartItems.length > 0 && (
              <SheetFooter className="mt-auto border-t pt-4">
                <div className="w-full space-y-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <Button
                    className="w-full btn-farm text-lg h-12"
                    onClick={() => setIsCheckoutOpen(true)}
                  >
                    Checkout
                  </Button>
                </div>
              </SheetFooter>
            )}
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search */}
          <Card className="farm-card">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </Card>

          {/* Categories */}
          <Card className="farm-card">
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category, index) => <div
                key={index}
                className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition-colors ${selectedCategory === category.name || (category.name === "All" && !selectedCategory) ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50'}`}
                onClick={() => setSelectedCategory(category.name === "All" ? null : category.name)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm">{category.name}</span>
                </div>
                {category.count > 0 && <Badge variant="secondary" className="text-xs">{category.count}</Badge>}
              </div>)}
            </div>
          </Card>

          {/* Filters */}
          <Card className="farm-card">
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Price Range</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    className="text-xs"
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  />
                  <Input
                    placeholder="Max"
                    className="text-xs"
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Features</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={featureFilters.fastDelivery}
                      onChange={(e) => setFeatureFilters({ ...featureFilters, fastDelivery: e.target.checked })}
                    />
                    Fast Delivery
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={featureFilters.organic}
                      onChange={(e) => setFeatureFilters({ ...featureFilters, organic: e.target.checked })}
                    />
                    Organic
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={featureFilters.inStock}
                      onChange={(e) => setFeatureFilters({ ...featureFilters, inStock: e.target.checked })}
                    />
                    In Stock
                  </label>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {/* Sort and Filter Bar */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">
              {filteredProducts.length} products found
            </p>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Sort
              </Button>
            </div>
          </div>

          {/* Products */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts
              .map((product) => (
                <Card key={product.id} className="farm-card group hover:shadow-glow transition-all overflow-hidden">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                    />

                    {
                      /* Badges */
                    }
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      {product.organic && <Badge className="bg-green-100 text-green-700 text-xs">Organic</Badge>}
                      {product.fastDelivery && <Badge className="bg-blue-100 text-blue-700 text-xs">Fast Delivery</Badge>}
                      {!product.inStock && <Badge variant="destructive" className="text-xs">Out of Stock</Badge>}
                    </div>

                    {
                      /* Wishlist */
                    }
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 bg-white/80 hover:bg-white"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLike(product.id);
                      }}
                    >
                      <Heart className={`w-4 h-4 transition-colors ${likedProductIds.has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                    </Button>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>

                    {
                      /* Rating */
                    }
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{product.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({product.reviews} reviews)
                      </span>
                    </div>

                    {
                      /* Seller Info */
                    }
                    <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{product.seller}, {product.location}</span>
                    </div>

                    {
                      /* Price */
                    }
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl font-bold text-primary">
                        ₹{product.price.toLocaleString()}
                      </span>
                      {product.originalPrice > product.price && <span className="text-sm text-muted-foreground line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>}
                    </div>

                    {
                      /* Actions */
                    }
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 btn-farm"
                        disabled={!product.inStock}
                        onClick={() => addToCart(product)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {product.inStock ? "Add to Cart" : "Out of Stock"}
                      </Button>
                    </div>
                  </div>
                </Card>))}
          </div>

          {
            /* Load More */
          }
          <div className="text-center mt-12">
            <Button variant="outline" className="w-full sm:w-auto">
              View More Products
            </Button>
          </div>
        </div>
      </div>
      <CheckoutDialog
        isOpen={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        cartItems={cartItems}
        totalAmount={cartTotal}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  </div>;
};

export default EcommercePage;
