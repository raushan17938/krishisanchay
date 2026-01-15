import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Check, X, Phone, User, Calendar, MapPin, Mail, MessageSquare } from "lucide-react";

const LandOwnerRequests = ({ onBack }) => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await axios.get('/land/requests');
            setRequests(response.data.data);
        } catch (error) {
            console.error("Error fetching requests:", error);
            // toast.error("Failed to load requests");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status, landTitle) => {
        try {
            const response = await axios.put(`/land/requests/${id}`, { status });
            if (response.data.success) {
                toast.success(`Request ${status} successfully`, {
                    description: status === 'approved'
                        ? `You have approved this request for ${landTitle}. Other pending requests for this land have been rejected.`
                        : null
                });
                fetchRequests(); // Refresh list to reflect changes (especially auto-rejections)
            }
        } catch (error) {
            console.error("Error updating status:", error);
            const errorMessage = error.response?.data?.message || "Failed to update status";
            toast.error(errorMessage);
        }
    };

    const openDetails = (request) => {
        setSelectedRequest(request);
        setIsDetailsOpen(true);
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (requests.length === 0) {
        return (
            <div className="container mx-auto px-6 py-8 pt-24">
                <Button variant="ghost" onClick={onBack} className="mb-4">
                    ← Back to Dashboard
                </Button>
                <div className="text-center p-8 border border-dashed rounded-lg bg-gray-50">
                    <p className="text-muted-foreground">No rental requests received yet.</p>
                </div>
            </div>
        );
    }

    // Group requests by Land
    const groupedRequests = requests.reduce((acc, req) => {
        const landId = req.land._id;
        if (!acc[landId]) {
            acc[landId] = {
                land: req.land,
                requests: []
            };
        }
        acc[landId].requests.push(req);
        return acc;
    }, {});

    return (
        <div className="container mx-auto px-6 py-8 pt-24">
            <Button variant="ghost" onClick={onBack} className="mb-4">
                ← Back to Dashboard
            </Button>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Land Rental Requests</h2>

                {Object.values(groupedRequests).map((group) => (
                    <Card key={group.land._id} className="overflow-hidden">
                        <CardHeader className="bg-muted/50 pb-3">
                            <CardTitle className="text-lg flex items-center justify-between">
                                <span>{group.land.title}</span>
                                <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {group.land.location}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {group.requests.map((request) => (
                                    <div
                                        key={request._id}
                                        className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => openDetails(request)}
                                    >
                                        <div className="space-y-1 flex-1">
                                            <div className="flex items-center gap-2 font-medium text-lg">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                {request.user.name}
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {request.user.phone || 'No phone'}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {request.duration || 'Duration not set'}
                                                </div>
                                            </div>
                                            {request.requestMessage && (
                                                <div className="text-sm text-gray-600 italic line-clamp-1 mt-1">
                                                    "{request.requestMessage}"
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 min-w-[140px]" onClick={(e) => e.stopPropagation()}>
                                            <Select
                                                defaultValue={request.status}
                                                onValueChange={(value) => handleStatusUpdate(request._id, value, group.land.title)}
                                            >
                                                <SelectTrigger className={`h-8 w-32 text-xs font-medium capitalize
                                                    ${request.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' : ''}
                                                    ${request.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' : ''}
                                                    ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}
                                                    ${request.status === 'completed' ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
                                                `}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="approved">Approved</SelectItem>
                                                    <SelectItem value="rejected">Rejected</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Request Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Request Details</DialogTitle>
                        <DialogDescription>
                            Application for {selectedRequest?.land?.title}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground">Applicant</h4>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span className="font-semibold">{selectedRequest.user.name}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground">Contact</h4>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        <span>{selectedRequest.user.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="h-3 w-3" />
                                        <span>{selectedRequest.user.email}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-sm font-medium text-muted-foreground">Proposed Duration</h4>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{selectedRequest.duration || 'Not specified'}</span>
                                </div>
                            </div>

                            <div className="space-y-1 bg-muted/50 p-3 rounded-md">
                                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <MessageSquare className="h-3 w-3" /> Message
                                </h4>
                                <p className="text-sm text-gray-700">
                                    {selectedRequest.requestMessage || "No message provided."}
                                </p>
                            </div>

                            <div className="pt-4 border-t flex justify-between items-center">
                                <span className="text-sm font-medium">Current Status:</span>
                                <Select
                                    defaultValue={selectedRequest.status}
                                    onValueChange={(value) => {
                                        handleStatusUpdate(selectedRequest._id, value, selectedRequest.land.title);
                                        setSelectedRequest({ ...selectedRequest, status: value }); // Update local detail view
                                    }}
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LandOwnerRequests;
