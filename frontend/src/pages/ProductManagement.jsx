import { getProducts, createProduct, updateProduct, deleteProduct } from "../api/product";
import { uploadImage } from "../api/upload";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit, Trash2, Package } from "lucide-react";

const ProductManagement = ({ onBack }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    unit: "per kg",
    quantity: "",
    description: "",
    image: "/api/placeholder/150/150",
    countInStock: 0
  });

  const categories = ["Grains", "Vegetables", "Fruits", "Spices", "Dairy", "Others"];
  const units = ["per kg", "per quintal", "per piece", "per dozen", "per liter"];

  // Fetch user's products
  useEffect(() => {
    const fetchUserProducts = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        // In a real app, backend would filter by seller, or we filter client side
        const data = await getProducts();
        if (data.success) {
          // Filter products owned by current user
          const userProducts = data.data.filter(p =>
            (typeof p.seller === 'object' ? p.seller._id : p.seller) === userInfo._id
          ).map(p => ({
            id: p._id,
            ...p,
            status: p.countInStock > 0 ? "available" : "sold",
            quantity: p.countInStock
          }));
          setProducts(userProducts);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load your products");
      }
    };
    fetchUserProducts();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      price: "",
      unit: "per kg",
      quantity: "",
      description: "",
      image: "/api/placeholder/150/150",
      countInStock: 0
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.category || !formData.price || !formData.quantity) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        countInStock: Number(formData.quantity)
      };
      const data = await createProduct(payload);

      if (data.success) {
        const newProduct = {
          id: data.data._id,
          ...data.data,
          status: "available",
          quantity: data.data.countInStock
        };
        setProducts(prev => [...prev, newProduct]);
        toast.success("Product added successfully");
        resetForm();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      unit: product.unit || "per kg",
      quantity: product.quantity,
      description: product.description,
      image: product.image,
      countInStock: product.quantity
    });
    setShowAddForm(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        countInStock: Number(formData.quantity)
      };
      const data = await updateProduct(editingProduct.id, payload);

      if (data.success) {
        setProducts(prev => prev.map(p =>
          p.id === editingProduct.id ? { ...p, ...data.data, quantity: data.data.countInStock } : p
        ));
        toast.success("Product updated successfully");
        resetForm();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        toast.success("Product deleted");
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete product");
      }
    }
  };

  const toggleProductStatus = async (id) => {
    // Toggle logic usually involves updating countInStock to 0 or restoring it
    // For simplicity let's find the product
    const product = products.find(p => p.id === id);
    if (!product) return;

    const newStatus = product.status === "available" ? "sold" : "available";
    const newQty = newStatus === "available" ? 10 : 0; // Mock restore qty

    try {
      await updateProduct(id, { countInStock: newQty });
      setProducts((prev) => prev.map(
        (p) => p.id === id ? { ...p, status: newStatus, quantity: newQty } : p
      ));
      toast.success(`Product marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };
  return <div className="min-h-screen bg-background p-4">
    <div className="max-w-6xl mx-auto">
      {
        /* Header */
      }
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Product Management</h1>
            <p className="text-muted-foreground">Manage your marketplace products</p>
          </div>
        </div>

        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {
        /* Add/Edit Product Form */
      }
      {showAddForm && <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {editingProduct ? "Edit Product" : "Add New Product"}
          </CardTitle>
          <CardDescription>
            {editingProduct ? "Update product information" : "Add a new product to your marketplace"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Fresh Wheat"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Available Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Product Image</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="flex-1"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      try {
                        setLoading(true);
                        const data = await uploadImage(file);
                        handleInputChange("image", data.data);
                        toast.success("Image uploaded!");
                      } catch (err) {
                        toast.error("Upload failed");
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                />
                {formData.image && formData.image !== "/api/placeholder/150/150" && (
                  <div className="h-10 w-10 overflow-hidden rounded border">
                    <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your product quality, features, etc."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => {
              setShowAddForm(false);
              setEditingProduct(null);
              setFormData({
                name: "",
                category: "",
                price: "",
                unit: "per kg",
                quantity: "",
                description: "",
                image: "/api/placeholder/150/150"
              });
            }}>
              Cancel
            </Button>
            <Button onClick={editingProduct ? handleUpdateProduct : handleAddProduct}>
              {editingProduct ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </CardContent>
      </Card>}

      {
        /* Products Grid */
      }
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => <Card key={product.id} className="overflow-hidden">
          <div className="aspect-square bg-muted overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <Badge variant={product.status === "available" ? "default" : "secondary"}>
                {product.status === "available" ? "Available" : "Sold"}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
            <p className="font-bold text-lg text-primary">₹{product.price} {product.unit}</p>

            {product.quantity && <p className="text-sm text-muted-foreground">Qty: {product.quantity}</p>}

            <p className="text-sm mt-2 line-clamp-2">{product.description}</p>

            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditProduct(product)}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleProductStatus(product.id)}
                className="flex-1"
              >
                {product.status === "available" ? "Mark Sold" : "Mark Available"}
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteProduct(product.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>)}

        {products.length === 0 && <div className="col-span-full text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No products yet</h3>
          <p className="text-muted-foreground mb-4">Start by adding your first product to the marketplace</p>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Product
          </Button>
        </div>}
      </div>
    </div>
  </div>;
};
var stdin_default = ProductManagement;
export {
  stdin_default as default
};
