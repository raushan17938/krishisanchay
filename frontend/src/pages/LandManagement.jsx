import { useState } from "react";
import { uploadImage } from "../api/upload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, MapPin, Camera, Edit3, Trash2, Map } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LocationPicker from "@/components/LocationPicker";

import { getLands, createLand, updateLand } from "../api/land";
import { toast } from "sonner";
import { useEffect } from "react";

const LandManagement = ({ onBack }) => {
  const [showMapModal, setShowMapModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [landId, setLandId] = useState(null);

  const [landImages, setLandImages] = useState([
    { id: 1, url: "/api/placeholder/300/200", description: "Main field view" },
    { id: 2, url: "/api/placeholder/300/200", description: "Irrigation system" },
    { id: 3, url: "/api/placeholder/300/200", description: "Soil quality" }
  ]);

  const [landDetails, setLandDetails] = useState({
    title: "",
    location: "",
    lat: 28.0006,
    lng: 75.7897,
    area: "",
    soilType: "",
    waterSource: "",
    crops: "",
    rentPrice: "",
    description: ""
  });

  // Fetch existing land on mount
  useEffect(() => {
    const fetchMyLand = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) return;

        // Fetch all lands using API service
        const response = await getLands();

        // Find land owned by this user
        const myLand = response.data.find(land =>
          (typeof land.owner === 'object' ? land.owner._id : land.owner) === userInfo._id
        );

        if (myLand) {
          setLandId(myLand._id);
          setLandDetails({
            title: myLand.title,
            location: myLand.location,
            lat: myLand.lat || 28.0006,
            lng: myLand.lng || 75.7897,
            area: myLand.size.replace(' acres', ''),
            soilType: myLand.soilType || "",
            waterSource: myLand.waterSource || "",
            crops: myLand.crops || "",
            rentPrice: myLand.price,
            description: myLand.description
          });
          // Also set image if available
          if (myLand.image) {
            setLandImages(prev => [{ id: Date.now(), url: myLand.image, description: "Main Image" }, ...prev.slice(1)]);
          }
        }
      } catch (error) {
        console.error("Error fetching land:", error);
        toast.error("Failed to load your land details");
      }
    };
    fetchMyLand();
  }, []);

  // Helper function to delete image from Cloudinary
  const deleteCloudinaryImage = async (public_id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/upload/${public_id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error("Failed to delete image", error);
    }
  };

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setLoading(true);
      try {
        const uploadPromises = Array.from(files).map(file => uploadImage(file));
        const results = await Promise.all(uploadPromises);

        const newImages = results.map((res, index) => ({
          id: Date.now() + index,
          url: res.data,
          public_id: res.public_id, // Store public_id
          description: "Uploaded Image"
        }));

        setLandImages(prev => [...prev, ...newImages]);
        toast.success("Images uploaded successfully");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload images");
      } finally {
        setLoading(false);
      }
    }
  };

  const removeImage = async (id) => {
    const imageAndIndex = landImages.find(img => img.id === id);
    if (imageAndIndex && imageAndIndex.public_id) {
      await deleteCloudinaryImage(imageAndIndex.public_id);
    }
    setLandImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleDetailsChange = (field, value) => {
    setLandDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationSelect = (locationData) => {
    setLandDetails(prev => ({
      ...prev,
      location: locationData.address,
      lat: locationData.lat,
      lng: locationData.lng
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        title: landDetails.title,
        location: landDetails.location,
        size: `${landDetails.area} acres`,
        price: Number(landDetails.rentPrice),
        description: landDetails.description,
        type: 'rent',
        lat: landDetails.lat,
        lng: landDetails.lng,
        soilType: landDetails.soilType,
        waterSource: landDetails.waterSource,
        crops: landDetails.crops,
        image: landImages.length > 0 ? landImages[0].url : null,
        imagePublicId: landImages.length > 0 ? landImages[0].public_id : null
      };

      if (landId) {
        // Check if there was an old image that was replaced (handled by removeImage generally, but if we just swap main image?)
        // The logic here is simple: current first image is MAIN.
        await updateLand(landId, payload);
        toast.success("Land details updated successfully!");
      } else {
        const response = await createLand(payload);
        setLandId(response.data._id);
        toast.success("Land listed successfully!");
      }
    } catch (error) {
      console.error("Error saving land:", error);
      toast.error(error.response?.data?.message || "Failed to save details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Land Management</h1>
            <p className="text-muted-foreground">Manage your land details and photos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Land Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Land Photos
              </CardTitle>
              <CardDescription>
                Upload and manage photos of your agricultural land
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Upload Button */}
              <div className="mb-6">
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload photos</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                  </div>
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {landImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.description}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      {image.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Land Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Land Details
              </CardTitle>
              <CardDescription>
                Update your land information and rental details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Land Title</Label>
                <Input
                  id="title"
                  value={landDetails.title}
                  onChange={(e) => handleDetailsChange("title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <Input
                    id="location"
                    readOnly
                    value={landDetails.location}
                    placeholder="Click to select location on map..."
                    className="bg-muted/50 cursor-pointer pr-10 hover:bg-muted/70 transition-colors"
                    onClick={() => setShowMapModal(true)}
                  />
                  <Map
                    className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                    onClick={() => setShowMapModal(true)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">Area (Acres)</Label>
                  <Input
                    id="area"
                    type="number"
                    value={landDetails.area}
                    onChange={(e) => handleDetailsChange("area", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="soilType">Soil Type</Label>
                  <Input
                    id="soilType"
                    value={landDetails.soilType}
                    onChange={(e) => handleDetailsChange("soilType", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="waterSource">Water Source</Label>
                <Input
                  id="waterSource"
                  value={landDetails.waterSource}
                  onChange={(e) => handleDetailsChange("waterSource", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="crops">Suitable Crops</Label>
                <Input
                  id="crops"
                  placeholder="e.g., Wheat, Rice, Cotton"
                  value={landDetails.crops}
                  onChange={(e) => handleDetailsChange("crops", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rentPrice">Rent Price per Month (₹)</Label>
                <Input
                  id="rentPrice"
                  type="number"
                  value={landDetails.rentPrice}
                  onChange={(e) => handleDetailsChange("rentPrice", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your land features, facilities, and benefits..."
                  value={landDetails.description}
                  onChange={(e) => handleDetailsChange("description", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status & Actions */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Available for Rent
            </Badge>
            <Badge variant="outline">
              <MapPin className="h-3 w-3 mr-1" />
              {landDetails.area} Acres
            </Badge>
          </div>

          <Button onClick={handleSave} className="w-full sm:w-auto">
            Save Changes
          </Button>
        </div>
      </div>

      {/* Map Selector Modal */}
      <Dialog open={showMapModal} onOpenChange={setShowMapModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Update Location</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              initialPosition={landDetails.lat ? { lat: landDetails.lat, lng: landDetails.lng } : null}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowMapModal(false)}>Cancel</Button>
            <Button onClick={() => setShowMapModal(false)}>Confirm Location</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandManagement;
