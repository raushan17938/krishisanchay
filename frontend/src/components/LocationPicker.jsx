import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, Navigation, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Fix for default marker icon in React-Leaflet not loading correctly
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Reset internal icon prototype
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// -- Sub-Components --

// Component to handle map center updates when position changes
const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    map.setView(center, zoom);
    return null;
};

// Component to fix map rendering issues inside Modals/Tabs by invalidating size
const MapRevalidator = () => {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100); // 100ms delay to allow modal transition to complete
        return () => clearTimeout(timer);
    }, [map]);
    return null;
};

// Component for the Draggable Marker
const DraggableMarker = ({ position, setPosition, onDragEnd }) => {
    const markerRef = useRef(null);

    const eventHandlers = React.useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const newPos = marker.getLatLng();
                    setPosition(newPos);
                    onDragEnd(newPos);
                }
            },
        }),
        [onDragEnd, setPosition]
    );

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        />
    );
};

const LocationPicker = ({ onLocationSelect, initialPosition, readOnly = false }) => {
    // Default position: Patna, Bihar
    const defaultPosition = { lat: 25.5941, lng: 85.1376 };
    // Use initialPosition if provided, or default
    const [position, setPosition] = useState(initialPosition || defaultPosition);
    const [address, setAddress] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [initialLoad, setInitialLoad] = useState(!initialPosition); // Only fetch initial address if no initialPos provided

    // If initialPosition is provided, you might want to fetch its address or just set it
    useEffect(() => {
        if (initialPosition) {
            // Only update and fetch if coordinates have significantly changed
            // This prevents infinite loops when parent creates a new object on every render
            const latDiff = Math.abs(initialPosition.lat - position.lat);
            const lngDiff = Math.abs(initialPosition.lng - position.lng);

            if (latDiff > 0.00001 || lngDiff > 0.00001) {
                setPosition(initialPosition);
                // Optionally fetch address for this position if not provided separately
                fetchAddress(initialPosition.lat, initialPosition.lng);
            }
        }
    }, [initialPosition]);

    // Reverse Geocoding: Coords -> Address
    const fetchAddress = async (lat, lng) => {
        try {
            // If readOnly, maybe we don't want to show loading or fetch? 
            // But if we want to show the address of the location being viewed, we might need it.
            setLoadingLocation(true);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();

            if (data && data.display_name) {
                setAddress(data.display_name);
                if (onLocationSelect && !readOnly) {
                    onLocationSelect({
                        lat,
                        lng,
                        address: data.display_name,
                        details: data.address
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching address:", error);
        } finally {
            setLoadingLocation(false);
            setInitialLoad(false);
        }
    };

    // Forward Geocoding: Text -> Coords
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=5&countrycodes=in`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon, display_name, address: addrDetails } = data[0];
                const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };

                setPosition(newPos);
                setAddress(display_name);

                if (onLocationSelect) {
                    onLocationSelect({
                        lat: newPos.lat,
                        lng: newPos.lng,
                        address: display_name,
                        details: addrDetails
                    });
                }
            } else {
                alert("Location not found. Try a different query.");
            }
        } catch (error) {
            console.error("Search error:", error);
            alert("Error searching location");
        } finally {
            setIsSearching(false);
        }
    };

    // Browser Geolocation
    const handleDetectLocation = () => {
        if (navigator.geolocation) {
            setLoadingLocation(true);
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const newPos = { lat: latitude, lng: longitude };
                    setPosition(newPos);
                    fetchAddress(latitude, longitude);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    alert("Unable to retrieve your location. Please check browser permissions.");
                    setLoadingLocation(false);
                }
            );
        } else {
            alert("Geolocation is not supported by your browser");
        }
    };

    // Initial load address fetch
    useEffect(() => {
        if (initialLoad && !readOnly) {
            fetchAddress(position.lat, position.lng);
        }
    }, [initialLoad]);

    return (
        <div className="space-y-4 w-full">
            {/* Controls Header - Hide in ReadOnly */}
            {!readOnly && (
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search village, city..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Button onClick={handleSearch} disabled={isSearching} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                        </Button>
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleDetectLocation}
                        className="flex items-center gap-2 border-primary text-primary hover:bg-primary/5"
                    >
                        <Navigation className="h-4 w-4" />
                        Detect Me
                    </Button>
                </div>
            )}

            {/* Map Display */}
            <div className={`relative ${readOnly ? 'h-64' : 'h-72 md:h-96'} w-full rounded-lg overflow-hidden border border-border shadow-sm z-0`}>
                {loadingLocation && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-[500] flex items-center justify-center">
                        <div className="bg-background px-4 py-2 rounded-md shadow-md flex items-center gap-2 border">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span className="text-sm font-medium">Fetching location...</span>
                        </div>
                    </div>
                )}

                <MapContainer
                    center={position}
                    zoom={13}
                    scrollWheelZoom={!readOnly}
                    dragging={!readOnly}
                    doubleClickZoom={!readOnly}
                    className="h-full w-full"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {/* Updates map view when position state changes */}
                    <ChangeView center={position} zoom={13} />

                    {/* Fixes rendering inside modal */}
                    <MapRevalidator />

                    <DraggableMarker
                        position={position}
                        setPosition={readOnly ? () => { } : setPosition}
                        onDragEnd={readOnly ? () => { } : (newPos) => fetchAddress(newPos.lat, newPos.lng)}
                    />
                </MapContainer>
            </div>

            {/* Selected Address Read-only */}
            <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {readOnly ? "Location Address" : "Detected Address"}
                    {/* Optional badge */}
                    {!readOnly && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        Drag pin to adjust
                    </span>}
                </label>
                <div className="relative">
                    <Input
                        readOnly
                        value={address || "Loading address..."}
                        className="bg-muted/50 text-foreground pr-10"
                    />
                </div>
            </div>
        </div>
    );
};

export default LocationPicker;
