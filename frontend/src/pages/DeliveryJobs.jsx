import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Package, Clock, ArrowLeft, Phone, Truck } from "lucide-react";
import { getAvailableDeliveryOrders } from "../api/order";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

const DeliveryJobs = ({ onBack }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await getAvailableDeliveryOrders();
                if (data.success) {
                    setJobs(data.data);
                } else {
                    toast.error("Failed to load delivery jobs");
                }
            } catch (error) {
                console.error("Error fetching jobs:", error);
                toast.error("Error loading jobs");
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const handleAcceptJob = (jobId) => {
        // Placeholder for accepting job logic
        toast.success("Job request sent! Wait for approval.");
    };

    if (loading) {
        return <div className="p-6 text-center">Loading delivery jobs...</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-6 pb-20">
            <Button
                variant="ghost"
                className="mb-6 pl-0 hover:bg-transparent hover:text-primary"
                onClick={onBack}
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
            </Button>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Find Delivery Jobs</h1>
                    <p className="text-muted-foreground">Deliver orders to earn extra income</p>
                </div>
            </div>

            {jobs.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No delivery jobs available</h3>
                    <p className="text-gray-500">Check back later for new orders.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {jobs.map((job) => (
                        <Card key={job._id} className="p-5 hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <Badge variant="secondary" className="mb-2 bg-orange-100 text-orange-700">
                                        Active Order
                                    </Badge>
                                    <h3 className="font-semibold text-lg flex items-center">
                                        <Package className="w-4 h-4 mr-2 text-primary" />
                                        Order #{job._id.substring(job._id.length - 6)}
                                    </h3>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-lg text-primary">₹{job.shippingPrice || 50}</span>
                                    <span className="text-xs text-muted-foreground">Earning</span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-start">
                                    <MapPin className="w-4 h-4 mr-2 mt-1 text-muted-foreground" />
                                    <div>
                                        <span className="text-xs text-muted-foreground block">Deliver To</span>
                                        <span className="text-sm font-medium">
                                            {job.shippingAddress?.city}, {job.shippingAddress?.postalCode}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <span className="text-sm">Paid: {new Date(job.paidAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <Button
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                                onClick={() => handleAcceptJob(job._id)}
                            >
                                Accept Delivery Job
                            </Button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DeliveryJobs;
