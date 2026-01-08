import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Search,
  Filter,
  Star,
  MapPin,
  Heart
} from "lucide-react";
import { getProducts } from "../api/product";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const EcommercePage = () => {
  const [cartItems, setCartItems] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        if (data.success) {
          setProducts(data.data.map(p => ({
            id: p._id,
            name: p.name,
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
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = [
    { name: "Seeds", count: 234, icon: "\u{1F331}" },
    { name: "Fertilizers", count: 156, icon: "\u{1F33F}" },
    { name: "Pesticides", count: 89, icon: "\u{1F6E1}\uFE0F" },
    { name: "Tools", count: 145, icon: "\u2692\uFE0F" },
    { name: "Irrigation", count: 67, icon: "\u{1F4A7}" },
    { name: "Machinery", count: 23, icon: "\u{1F69C}" }
  ];

  const addToCart = (productId) => {
    setCartItems((prev) => prev + 1);
    toast.success("Added to cart!");
  };
  return <div className="min-h-screen bg-background pt-20 lg:pt-8">
    <div className="container mx-auto px-6 py-8">
      {
        /* Header */
      }
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Agricultural Shop
          </h1>
          <p className="text-xl text-muted-foreground">
            Quality agricultural products directly for farmers
          </p>
        </div>

        <Button className="btn-farm relative">
          <ShoppingCart className="w-5 h-5 mr-2" />
          Cart
          {cartItems > 0 && <Badge className="absolute -top-2 -right-2 bg-red-500 text-white min-w-[1.5rem] h-6 rounded-full flex items-center justify-center text-xs">
            {cartItems}
          </Badge>}
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {
          /* Sidebar */
        }
        <div className="lg:col-span-1 space-y-6">
          {
            /* Search */
          }
          <Card className="farm-card">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search products..." className="pl-10" />
            </div>
          </Card>

          {
            /* Categories */
          }
          <Card className="farm-card">
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category, index) => <div key={index} className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm">{category.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">{category.count}</Badge>
              </div>)}
            </div>
          </Card>

          {
            /* Filters */
          }
          <Card className="farm-card">
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Price Range</h4>
                <div className="flex gap-2">
                  <Input placeholder="Min" className="text-xs" />
                  <Input placeholder="Max" className="text-xs" />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Features</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    Fast Delivery
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    Organic
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    In Stock
                  </label>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {
          /* Product Grid */
        }
        <div className="lg:col-span-3">
          {
            /* Sort and Filter Bar */
          }
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">
              {products.length} products found
            </p>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Sort
              </Button>
            </div>
          </div>

          {
            /* Products */
          }
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => <Card key={product.id} className="farm-card group hover:shadow-glow transition-all overflow-hidden">
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
                >
                  <Heart className="w-4 h-4" />
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
                    onClick={() => addToCart(product.id)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {product.inStock ? "Add to Cart" : "Out of Stock"}
                  </Button>
                </div>
              </div>
            </Card>)}
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
    </div>
  </div>;
};
var stdin_default = EcommercePage;
export {
  stdin_default as default
};
