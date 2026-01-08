import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Droplets,
  Sprout,
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  User,
  Home
} from "lucide-react";
const mockFarmers = [
  {
    id: 1,
    name: "Rajesh Kumar",
    contact: "+91 9876543210",
    email: "rajesh@example.com",
    village: "Bagpat",
    district: "Uttar Pradesh",
    address: "Village - Bagpat, Tehsil - Bagpat, District - Bagpat, Uttar Pradesh - 250609",
    landSize: "5 acres",
    rentPrice: "\u20B915,000/month",
    rentDuration: "12 months",
    status: "available",
    coordinates: { lat: 28.9519, lng: 77.2115 },
    soilType: "Loamy Soil",
    soilQuality: "Excellent",
    irrigation: "Tubewell",
    crops: ["Wheat", "Rice", "Maize"],
    floodProne: false,
    propertyArea: "5 acres (20,234 sq meters)",
    documents: "Khasra, Khatauni, Registry available",
    images: [
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
      "https://images.unsplash.com/photo-1592982853225-86a32793d128?w=800",
      "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800",
      "https://images.unsplash.com/photo-1589922763928-062d2c309c11?w=800"
    ]
  },
  {
    id: 2,
    name: "\u0938\u0941\u0928\u0940\u0924\u093E \u0926\u0947\u0935\u0940",
    contact: "+91 8765432109",
    email: "sunita@example.com",
    village: "\u092E\u0947\u0930\u0920",
    district: "\u0909\u0924\u094D\u0924\u0930 \u092A\u094D\u0930\u0926\u0947\u0936",
    address: "\u0917\u093E\u0902\u0935 - \u092E\u0947\u0930\u0920, \u0924\u0939\u0938\u0940\u0932 - \u092E\u0947\u0930\u0920, \u091C\u093F\u0932\u093E - \u092E\u0947\u0930\u0920, \u0909\u0924\u094D\u0924\u0930 \u092A\u094D\u0930\u0926\u0947\u0936 - 250001",
    landSize: "3 \u090F\u0915\u0921\u093C",
    rentPrice: "\u20B912,000/\u092E\u093E\u0939",
    rentDuration: "6 \u092E\u0939\u0940\u0928\u0947",
    status: "rented",
    coordinates: { lat: 28.9845, lng: 77.7064 },
    soilType: "\u091A\u093F\u0915\u0928\u0940 \u092E\u093F\u091F\u094D\u091F\u0940",
    soilQuality: "\u0905\u091A\u094D\u091B\u0940",
    irrigation: "\u0928\u0939\u0930",
    crops: ["\u0938\u0930\u0938\u094B\u0902", "\u0906\u0932\u0942", "\u092E\u091F\u0930"],
    floodProne: true,
    propertyArea: "3 \u090F\u0915\u0921\u093C (12,141 \u0935\u0930\u094D\u0917 \u092E\u0940\u091F\u0930)",
    documents: "\u0916\u0938\u0930\u093E, \u0916\u0924\u094C\u0928\u0940 \u0909\u092A\u0932\u092C\u094D\u0927",
    images: [
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800",
      "https://images.unsplash.com/photo-1606755962773-d324e9dabd96?w=800",
      "https://images.unsplash.com/photo-1566495648174-5176c0da7d47?w=800"
    ]
  },
  {
    id: 3,
    name: "\u0905\u092E\u093F\u0924 \u0936\u0930\u094D\u092E\u093E",
    contact: "+91 7654321098",
    email: "amit@example.com",
    village: "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926",
    district: "\u0909\u0924\u094D\u0924\u0930 \u092A\u094D\u0930\u0926\u0947\u0936",
    address: "\u0917\u093E\u0902\u0935 - \u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926, \u0924\u0939\u0938\u0940\u0932 - \u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926, \u091C\u093F\u0932\u093E - \u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926, \u0909\u0924\u094D\u0924\u0930 \u092A\u094D\u0930\u0926\u0947\u0936 - 201001",
    landSize: "8 \u090F\u0915\u0921\u093C",
    rentPrice: "\u20B925,000/\u092E\u093E\u0939",
    rentDuration: "24 \u092E\u0939\u0940\u0928\u0947",
    status: "available",
    coordinates: { lat: 28.6692, lng: 77.4538 },
    soilType: "\u092C\u0932\u0941\u0908 \u0926\u094B\u092E\u091F",
    soilQuality: "\u0909\u0924\u094D\u0924\u092E",
    irrigation: "\u092C\u094B\u0930\u0935\u0947\u0932",
    crops: ["\u0917\u0928\u094D\u0928\u093E", "\u0927\u093E\u0928", "\u0938\u092C\u094D\u091C\u093F\u092F\u093E\u0902"],
    floodProne: false,
    propertyArea: "8 \u090F\u0915\u0921\u093C (32,375 \u0935\u0930\u094D\u0917 \u092E\u0940\u091F\u0930)",
    documents: "\u0938\u092D\u0940 \u0926\u0938\u094D\u0924\u093E\u0935\u0947\u091C \u0909\u092A\u0932\u092C\u094D\u0927",
    images: [
      "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800",
      "https://images.unsplash.com/photo-1589922763928-062d2c309c11?w=800",
      "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=800",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
    ]
  }
];
const FarmerDetail = ({ farmerId, onBack }) => {
  const [farmer, setFarmer] = useState(null);
  useEffect(() => {
    const foundFarmer = mockFarmers.find((f) => f.id === farmerId);
    setFarmer(foundFarmer);
  }, [farmerId]);
  if (!farmer) {
    return <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 flex items-center justify-center">
        <Card className="p-8">
          <p className="text-center text-gray-600">Farmer information not found</p>
          <Button onClick={onBack} className="mt-4 w-full">
            Go Back
          </Button>
        </Card>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 p-4">
      <div className="mx-auto max-w-6xl">
        {
    /* Header */
  }
        <div className="mb-6 flex items-center gap-4">
          <Button
    onClick={onBack}
    variant="outline"
    size="lg"
    className="border-green-200 hover:bg-green-50"
  >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-green-800">{farmer.name}</h1>
            <p className="text-green-600">{farmer.village}, {farmer.district}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {
    /* Left Column - Images and Map */
  }
          <div className="space-y-6">
            {
    /* Image Carousel */
  }
            <Card className="overflow-hidden border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Land Images
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Carousel className="w-full">
                  <CarouselContent>
                    {farmer.images.map((image, index) => <CarouselItem key={index}>
                        <div className="aspect-video">
                          <img
    src={image}
    alt={`Land image ${index + 1}`}
    className="h-full w-full object-cover"
  />
                        </div>
                      </CarouselItem>)}
                  </CarouselContent>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </Carousel>
              </CardContent>
            </Card>

            {
    /* Map */
  }
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Land Location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video bg-green-100 flex items-center justify-center">
                  <div className="text-center text-green-700">
                    <MapPin className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">Google Maps Integration</p>
                    <p className="text-xs text-green-600">
                      Lat: {farmer.coordinates.lat}, Lng: {farmer.coordinates.lng}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {
    /* Right Column - Details */
  }
          <div className="space-y-6">
            {
    /* Contact Information */
  }
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-green-600" />
                    <span className="font-medium">{farmer.contact}</span>
                  </div>
                  {farmer.email && <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-green-600" />
                      <span>{farmer.email}</span>
                    </div>}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-green-600 mt-1" />
                    <span className="text-sm">{farmer.address}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {
    /* Land Details */
  }
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Sprout className="h-5 w-5" />
                  Land Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-600">Rent Price</p>
                    <p className="font-semibold text-lg text-green-700">{farmer.rentPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">{farmer.rentDuration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Area</p>
                    <p className="font-medium">{farmer.propertyArea}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Soil Type</p>
                    <p className="font-medium">{farmer.soilType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Soil Quality</p>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {farmer.soilQuality}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Irrigation</p>
                    <div className="flex items-center gap-1">
                      <Droplets className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{farmer.irrigation}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm text-gray-600 mb-2">Crops that can be grown</p>
                  <div className="flex flex-wrap gap-2">
                    {farmer.crops.map((crop, index) => <Badge key={index} variant="outline" className="border-green-200 text-green-700">
                        {crop}
                      </Badge>)}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center gap-2">
                    {farmer.floodProne ? <>
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <span className="text-orange-700">Flood prone area</span>
                      </> : <>
                        <Shield className="h-5 w-5 text-green-500" />
                        <span className="text-green-700">Safe from floods</span>
                      </>}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">{farmer.documents}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {
    /* Status and Action */
  }
            <Card className="border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Badge
    variant={farmer.status === "available" ? "default" : "secondary"}
    className={`text-lg px-6 py-2 ${farmer.status === "available" ? "bg-green-500 hover:bg-green-600" : "bg-red-100 text-red-800"}`}
  >
                    {farmer.status === "available" ? <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Available for Rent
                      </> : "Already Rented Out"}
                  </Badge>
                  
                  <Button
    size="lg"
    disabled={farmer.status !== "available"}
    className={`w-full ${farmer.status === "available" ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}`}
  >
                    {farmer.status === "available" ? "Rent Now" : "Not Available"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>;
};
var stdin_default = FarmerDetail;
export {
  stdin_default as default
};
