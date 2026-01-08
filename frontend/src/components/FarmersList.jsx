import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, MapPin, Phone, User } from "lucide-react";
const mockFarmers = [
  {
    id: 1,
    name: "Rajesh Kumar",
    contact: "+91 9876543210",
    email: "rajesh@example.com",
    village: "Bagpat",
    district: "Uttar Pradesh",
    landSize: "5 acres",
    rentPrice: "\u20B915,000/month",
    status: "available",
    coordinates: { lat: 28.9519, lng: 77.2115 },
    soilType: "Loamy Soil",
    irrigation: "Tubewell",
    crops: ["Wheat", "Rice", "Maize"],
    floodProne: false,
    images: [
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500",
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500",
      "https://images.unsplash.com/photo-1592982853225-86a32793d128?w=500"
    ]
  },
  {
    id: 2,
    name: "Sunita Devi",
    contact: "+91 8765432109",
    email: "sunita@example.com",
    village: "Meerut",
    district: "Uttar Pradesh",
    landSize: "3 acres",
    rentPrice: "\u20B912,000/month",
    status: "rented",
    coordinates: { lat: 28.9845, lng: 77.7064 },
    soilType: "Clay Soil",
    irrigation: "Canal",
    crops: ["Mustard", "Potato", "Peas"],
    floodProne: true,
    images: [
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500",
      "https://images.unsplash.com/photo-1606755962773-d324e9dabd96?w=500"
    ]
  },
  {
    id: 3,
    name: "Amit Sharma",
    contact: "+91 7654321098",
    email: "amit@example.com",
    village: "Ghaziabad",
    district: "Uttar Pradesh",
    landSize: "8 acres",
    rentPrice: "\u20B925,000/month",
    status: "available",
    coordinates: { lat: 28.6692, lng: 77.4538 },
    soilType: "Sandy Loam",
    irrigation: "Borewell",
    crops: ["Sugarcane", "Rice", "Vegetables"],
    floodProne: false,
    images: [
      "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=500",
      "https://images.unsplash.com/photo-1589922763928-062d2c309c11?w=500",
      "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=500",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"
    ]
  },
  {
    id: 4,
    name: "Preeti Yadav",
    contact: "+91 6543210987",
    email: "preeti@example.com",
    village: "Bulandshahr",
    district: "Uttar Pradesh",
    landSize: "2 acres",
    rentPrice: "\u20B98,000/month",
    status: "available",
    coordinates: { lat: 28.4089, lng: 77.8453 },
    soilType: "Black Soil",
    irrigation: "Rain-fed",
    crops: ["Jowar", "Bajra", "Pulses"],
    floodProne: false,
    images: [
      "https://images.unsplash.com/photo-1566495648174-5176c0da7d47?w=500",
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500"
    ]
  }
];
const FarmersList = ({ onViewFarmer }) => {
  const [farmers] = useState(mockFarmers);
  return <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 p-4">
      <div className="mx-auto max-w-7xl">
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="border-b border-green-100 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <User className="h-8 w-8" />
              Land Rental - Farmers List
            </CardTitle>
            <p className="text-green-100">Browse available land for rental from farmers</p>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="overflow-x-auto rounded-lg border border-green-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-green-50 hover:bg-green-50">
                    <TableHead className="font-semibold text-green-800">Farmer Name</TableHead>
                    <TableHead className="font-semibold text-green-800">Contact</TableHead>
                    <TableHead className="font-semibold text-green-800">Village</TableHead>
                    <TableHead className="font-semibold text-green-800">Land Size</TableHead>
                    <TableHead className="font-semibold text-green-800">Rent Price</TableHead>
                    <TableHead className="font-semibold text-green-800">Status</TableHead>
                    <TableHead className="font-semibold text-green-800">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {farmers.map((farmer) => <TableRow
    key={farmer.id}
    className="hover:bg-green-50/50 transition-colors border-b border-green-100"
  >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-green-600" />
                          </div>
                          {farmer.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-green-600" />
                          {farmer.contact}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-green-600" />
                          {farmer.village}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {farmer.landSize}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-green-700">
                        {farmer.rentPrice}
                      </TableCell>
                      <TableCell>
                        <Badge
    variant={farmer.status === "available" ? "default" : "secondary"}
    className={farmer.status === "available" ? "bg-green-500 hover:bg-green-600" : "bg-red-100 text-red-800"}
  >
                          {farmer.status === "available" ? "Available" : "Rented"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
    onClick={() => onViewFarmer(farmer.id)}
    size="sm"
    className="bg-green-600 hover:bg-green-700 gap-2"
  >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </div>
            
            {farmers.length === 0 && <div className="text-center py-12 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No farmers available</p>
              </div>}
          </CardContent>
        </Card>
      </div>
    </div>;
};
var stdin_default = FarmersList;
export {
  stdin_default as default
};
