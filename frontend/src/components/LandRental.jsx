import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Ruler, ShieldCheck, Loader2, Map } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import LocationPicker from './LocationPicker';

import { getLands, createLand, requestLand } from "../api/land";
import { toast } from "sonner";

// ... imports

const LandRental = () => {
    const [lands, setLands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showListModal, setShowListModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);
    const [selectedLand, setSelectedLand] = useState(null);
    const [requestMessage, setRequestMessage] = useState("");
    const [newListing, setNewListing] = useState({
        title: "",
        size: "",
        price: "",
        type: "rent",
        description: "",
        locationName: "",
        lat: null,
        lng: null,
        image: ""
    });

    // Fetch lands from backend
    useEffect(() => {
        const fetchLands = async () => {
            try {
                const data = await getLands();
                if (data.success) {
                    // Map backend data to frontend structure if needed
                    const mappedLands = data.data.map(land => ({
                        ...land,
                        locationName: land.location,
                        // handle owner if it's populated object or id string
                        owner: typeof land.owner === 'object' ? land.owner : { name: "Unknown", isVerified: false }
                    }));
                    setLands(mappedLands);
                }
            } catch (error) {
                console.error("Error fetching lands:", error);
                toast.error("Failed to load listings");
            }
        };
        fetchLands();
    }, []);

    const handleViewDetails = (land) => {
        setSelectedLand(land);
        setShowDetailsModal(true);
    };

    const handleRequestLand = (land) => {
        setSelectedLand(land);
        setShowRequestModal(true);
    };

    const submitRequest = async () => {
        if (!requestMessage.trim()) {
            toast.error("Please enter a message");
            return;
        }
        setLoading(true);
        try {
            await requestLand(selectedLand._id, {
                message: requestMessage,
                duration: "11 Months" // Hardcoded for now, should be input
            });
            toast.success("Request sent to owner!");
            setShowRequestModal(false);
            setRequestMessage("");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to send request");
        } finally {
            setLoading(false);
        }
    };

    const handleLocationSelect = (location) => {
        setNewListing(prev => ({
            ...prev,
            locationName: location.address,
            lat: location.lat,
            lng: location.lng
        }));
        setShowMapModal(false);
    };

    const handleListLand = async () => {
        // Validate
        if (!newListing.title || !newListing.price || !newListing.locationName) {
            toast.error("Please fill required fields (Title, Price, Location)");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title: newListing.title,
                size: newListing.size,
                price: Number(newListing.price),
                type: newListing.type,
                description: newListing.description,
                location: newListing.locationName,
                lat: newListing.lat,
                lng: newListing.lng,
                image: newListing.image
            };

            const data = await createLand(payload);

            if (data.success) {
                toast.success("Land listed successfully!");
                // Add to local list immediately
                const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
                setLands(prev => [{
                    ...data.data,
                    locationName: data.data.location,
                    owner: userInfo // optimistic user data
                }, ...prev]);

                setShowListModal(false);
                setNewListing({ title: "", size: "", price: "", type: "rent", description: "", locationName: "", lat: null, lng: null, image: "" });
            }
        } catch (error) {
            console.error("List error:", error);
            toast.error(error.response?.data?.message || "Failed to list land");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-6 py-8 pt-24">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-green-700 bg-clip-text text-transparent">Land Rental & Lease</h1>
                    <p className="text-muted-foreground mt-2">Find verified land for your agricultural needs</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lands.map((land) => (
                    <Card key={land._id} className="farm-card group overflow-hidden">
                        <div className="h-48 overflow-hidden relative">
                            <img
                                src={land.image || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop"}
                                alt={land.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute top-3 right-3">
                                <Badge className={`${land.type === 'rent' ? 'bg-green-500' : 'bg-blue-500'}`}>
                                    {land.type === 'rent' ? 'For Rent' : 'For Lease'}
                                </Badge>
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-lg line-clamp-1">{land.title}</h3>
                                <span className="font-bold text-primary">₹{land.price.toLocaleString()}</span>
                            </div>

                            <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span className="line-clamp-1">{land.locationName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Ruler className="w-4 h-4 text-primary" />
                                    {land.size}
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className={`w-4 h-4 ${land.owner?.isVerified ? 'text-green-500' : 'text-gray-400'}`} />
                                    {land.owner?.name || "Owner"} {land.owner?.isVerified && <span className="text-xs text-green-600">(Verified)</span>}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1" onClick={() => handleViewDetails(land)}>View Details</Button>
                                <Button
                                    className="flex-1 bg-gradient-primary text-white hover:opacity-90"
                                    onClick={() => handleRequestLand(land)}
                                >
                                    Request
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Request Modal */}
            <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Request for {selectedLand?.title}</DialogTitle>
                        <DialogDescription>
                            Send a request to the owner. Once approved, you will receive an OTP for secure handover.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Message to Owner</label>
                            <Textarea
                                placeholder="I am interested in renting this land for wheat cultivation..."
                                value={requestMessage}
                                onChange={(e) => setRequestMessage(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Duration (Months/Years)</label>
                            <Input placeholder="e.g., 11 Months" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRequestModal(false)}>Cancel</Button>
                        <Button className="btn-farm" onClick={submitRequest} disabled={loading}>
                            {loading ? "Sending..." : "Send Request"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Details Modal (With Map View) */}
            <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedLand?.title}</DialogTitle>
                        <DialogDescription>
                            Land Details and Location
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLand && (
                        <div className="space-y-6 py-4">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <img
                                        src={selectedLand.image || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop"}
                                        alt={selectedLand.title}
                                        className="w-full h-64 object-cover rounded-lg shadow-sm"
                                    />
                                    <div className="mt-4 space-y-2">
                                        <p className="text-lg font-bold text-primary">₹{selectedLand.price.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/ season</span></p>
                                        <p className="flex items-center gap-2 text-muted-foreground"><Ruler className="w-4 h-4" /> {selectedLand.size}</p>
                                        <p className="text-sm">{selectedLand.description}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold flex items-center gap-2"><MapPin className="w-4 h-4" /> Location Map</h3>
                                    <div className="border rounded-lg overflow-hidden shadow-sm">
                                        {/* Read-Only Map View */}
                                        <LocationPicker
                                            readOnly={true}
                                            initialPosition={selectedLand.lat ? { lat: selectedLand.lat, lng: selectedLand.lng } : null}
                                        />
                                    </div>
                                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded space-y-1">
                                        <p><strong>Soil Type:</strong> {selectedLand.soilType || 'N/A'}</p>
                                        <p><strong>Water Source:</strong> {selectedLand.waterSource || 'N/A'}</p>
                                        <p><strong>Suitable Crops:</strong> {selectedLand.crops || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setShowDetailsModal(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* List Land Modal */}
            <Dialog open={showListModal} onOpenChange={setShowListModal}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>List Your Land</DialogTitle>
                        <DialogDescription>
                            Fill in the details to rent or lease your land.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title *</label>
                                <Input
                                    value={newListing.title}
                                    onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Price (₹) *</label>
                                <Input
                                    type="number"
                                    value={newListing.price}
                                    onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Size</label>
                                <Input value={newListing.size} onChange={(e) => setNewListing({ ...newListing, size: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <select className="flex h-9 w-full border rounded-md px-3 text-sm"
                                    value={newListing.type}
                                    onChange={(e) => setNewListing({ ...newListing, type: e.target.value })}
                                >
                                    <option value="rent">Rent</option>
                                    <option value="lease">Lease</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea value={newListing.description} onChange={(e) => setNewListing({ ...newListing, description: e.target.value })} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Location *</label>
                            <div className="relative">
                                <Input
                                    readOnly
                                    placeholder="Click to select location on map..."
                                    value={newListing.locationName}
                                    className="bg-muted/50 cursor-pointer pr-10 hover:bg-muted/70 transition-colors"
                                    onClick={() => setShowMapModal(true)}
                                />
                                <Map
                                    className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                                    onClick={() => setShowMapModal(true)}
                                />
                            </div>
                        </div>
                    </div>

                    <Button className="w-full btn-farm" onClick={handleListLand} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : "Submit Listing"}
                    </Button>
                </DialogContent>
            </Dialog>

            {/* Map Selector Modal (Nested) */}
            <Dialog open={showMapModal} onOpenChange={setShowMapModal}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Select Location</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <LocationPicker onLocationSelect={handleLocationSelect} />
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

export default LandRental;
