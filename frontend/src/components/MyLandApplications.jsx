import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, MapPin, Phone, User } from "lucide-react";

const MyLandApplications = ({ onBack }) => {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await axios.get('/land/my-applications');
            setApplications(response.data.data);
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (applications.length === 0) {
        return (
            <div className="container mx-auto px-6 py-8 pt-24">
                <Button variant="ghost" onClick={onBack} className="mb-4">
                    ← Back to Dashboard
                </Button>
                <div className="text-center p-8 border border-dashed rounded-lg bg-gray-50">
                    <p className="text-muted-foreground">You haven't sent any land rental requests yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-8 pt-24">
            <Button variant="ghost" onClick={onBack} className="mb-4">
                ← Back to Dashboard
            </Button>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Sent Applications</h2>
                <Button variant="outline" onClick={() => { setIsLoading(true); fetchApplications(); }}>
                    Refresh Status
                </Button>
            </div>

            <div className="grid gap-6">
                {applications.map((app) => (
                    <Card key={app._id} className="overflow-hidden">
                        <CardHeader className="bg-muted/50 pb-3">
                            <CardTitle className="text-lg flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <span>{app.land?.title || 'Unknown Land'}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold w-fit
                                    ${app.status === 'approved' ? 'bg-green-100 text-green-700' : ''}
                                    ${app.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                                    ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                                    ${app.status === 'completed' ? 'bg-blue-100 text-blue-700' : ''}
                                `}>
                                    {app.status.toUpperCase()}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        {app.land?.location || 'Location not available'}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        Duration: {app.duration || 'Not specified'}
                                    </div>
                                    <div className="text-sm font-semibold text-primary">
                                        Price: ₹{app.land?.price?.toLocaleString() || 'N/A'}
                                    </div>
                                </div>

                                <div className="space-y-2 border-l pl-4">
                                    <p className="text-sm font-medium mb-1">Owner Contact:</p>
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        {app.owner?.name || 'Unknown'}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        {app.owner?.phone || app.owner?.mobile || 'No phone available'}
                                    </div>
                                    <div className="text-sm text-blue-600">
                                        {app.owner?.email}
                                    </div>
                                </div>
                            </div>

                            {app.requestMessage && (
                                <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
                                    <span className="font-semibold">Your Message:</span> "{app.requestMessage}"
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default MyLandApplications;
