import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, CheckCircle, Store, Tractor, Loader2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "../../api/upload";
import { requestVerification, getMySellerRequest } from "../../api/seller";

const SellerVerification = ({ onBack }) => {
    const [step, setStep] = useState(1);
    const [userType, setUserType] = useState("farmer"); // farmer or shopkeeper
    const [loading, setLoading] = useState(false);
    const [existingRequest, setExistingRequest] = useState(null);
    const [fetchingStatus, setFetchingStatus] = useState(true);

    const [formData, setFormData] = useState({
        phone: "",
        address: "",
        shopName: "",
        gstNumber: "",
        landSize: "",
        cropTypes: "",
        document: null
    });

    // Check for existing request on mount
    useState(() => {
        const checkStatus = async () => {
            try {
                const res = await getMySellerRequest();
                if (res.data.success && res.data.data) {
                    setExistingRequest(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch request status", error);
            } finally {
                setFetchingStatus(false);
            }
        };
        checkStatus();
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, document: e.target.files[0] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.document) {
            toast.error("Please upload the required document");
            return;
        }

        setLoading(true);
        try {
            // 1. Upload Document
            let documentUrl = "";
            try {
                const uploadRes = await uploadImage(formData.document);
                documentUrl = uploadRes.data; // Assuming api/upload returns URL in data property
            } catch (err) {
                console.error("Image upload failed", err);
                toast.error("Failed to upload document image");
                setLoading(false);
                return;
            }

            // 2. Prepare Payload
            const payload = {
                type: userType,
                phone: formData.phone,
                address: formData.address,
                documentImage: documentUrl
            };

            if (userType === 'shopkeeper') {
                payload.shopName = formData.shopName;
                payload.gstNumber = formData.gstNumber;
            } else {
                payload.landSize = formData.landSize;
                // Convert comma separated crops to array if backend expects array, or keep as string?
                // Backend model: cropTypes: [String]
                payload.cropTypes = formData.cropTypes.split(',').map(c => c.trim());
            }

            // 3. Submit Request
            const res = await requestVerification(payload);

            if (res.data.success) {
                setStep(3); // Success step
                toast.success("Application submitted successfully!");
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error(error.response?.data?.message || "Failed to submit request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary" onClick={onBack}>
                ← Back to Dashboard
            </Button>

            <Card className="p-8">
                {fetchingStatus ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : existingRequest && existingRequest.status !== 'rejected' ? (
                    // Show Status View for Pending/Approved
                    <div className="text-center py-8">
                        {existingRequest.status === 'pending' ? (
                            <>
                                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Clock className="w-8 h-8 text-yellow-600" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Application Under Review</h2>
                                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                                    Your application to become a seller is currently being reviewed by our admins.
                                </p>
                                <div className="bg-gray-50 p-4 rounded-lg max-w-sm mx-auto text-left text-sm mb-6">
                                    <p><span className="font-semibold">Submitted on:</span> {new Date(existingRequest.createdAt).toLocaleDateString()}</p>
                                    <p><span className="font-semibold">Type:</span> <span className="capitalize">{existingRequest.type}</span></p>
                                </div>
                                <Button onClick={onBack}>Return to Dashboard</Button>
                            </>
                        ) : (
                            <>
                                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">You are a Verified Seller!</h2>
                                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                    Congratulations! Your application has been approved. You can now list products and manage your shop.
                                </p>
                                <Button onClick={onBack}>Go to Seller Dashboard</Button>
                            </>
                        )}
                    </div>
                ) : (
                    // Show Form (if no request OR request was rejected)
                    <>
                        {existingRequest && existingRequest.status === 'rejected' && step === 1 && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start gap-3">
                                <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">Previous Application Rejected</p>
                                    <p className="text-sm mt-1">{existingRequest.adminComments || "Requirements not met."}</p>
                                    <p className="text-sm mt-2 font-medium">You can submit a new application below.</p>
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-center">Become a Verified Seller</h2>
                                <p className="text-center text-muted-foreground">
                                    Sell your produce or agricultural products on Krishi Sanchay. Choose your profile type to begin.
                                </p>

                                <div className="grid md:grid-cols-2 gap-6 mt-8">
                                    <div
                                        className={`border-2 rounded-xl p-6 cursor-pointer transition-all hover:border-primary ${userType === 'farmer' ? 'border-primary bg-primary/5' : 'border-border'}`}
                                        onClick={() => setUserType('farmer')}
                                    >
                                        <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                            <Tractor className="w-6 h-6 text-green-700" />
                                        </div>
                                        <h3 className="font-semibold text-lg mb-2">I am a Farmer</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Verify your land and identity to sell crops directly to buyers.
                                        </p>
                                    </div>

                                    <div
                                        className={`border-2 rounded-xl p-6 cursor-pointer transition-all hover:border-primary ${userType === 'shopkeeper' ? 'border-primary bg-primary/5' : 'border-border'}`}
                                        onClick={() => setUserType('shopkeeper')}
                                    >
                                        <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                            <Store className="w-6 h-6 text-blue-700" />
                                        </div>
                                        <h3 className="font-semibold text-lg mb-2">I am a Shop Owner</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Verify your shop details to sell seeds, fertilizers, and tools.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-center mt-6">
                                    <Button size="lg" className="px-8" onClick={() => setStep(2)}>
                                        Continue as {userType === 'farmer' ? 'Farmer' : 'Shop Owner'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold">Verification Details</h2>
                                    <p className="text-muted-foreground">Please provide accurate information for quick approval.</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Phone Number</Label>
                                        <Input
                                            placeholder="+91 98765 43210"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Full Address</Label>
                                        <Input
                                            placeholder="Village/City address"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                {userType === 'shopkeeper' ? (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Shop Name</Label>
                                            <Input
                                                placeholder="e.g. Kisan Seva Kendra"
                                                value={formData.shopName}
                                                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>GST Number (Optional)</Label>
                                            <Input
                                                placeholder="GSTIN..."
                                                value={formData.gstNumber}
                                                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Total Land Size (Acres)</Label>
                                            <Input
                                                placeholder="e.g. 5.5"
                                                value={formData.landSize}
                                                onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Major Crops</Label>
                                            <Input
                                                placeholder="e.g. Wheat, Rice, Sugarcane"
                                                value={formData.cropTypes}
                                                onChange={(e) => setFormData({ ...formData, cropTypes: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>{userType === 'farmer' ? 'Upload Kisan Card or ID Proof' : 'Upload Shop License or ID Proof'}</Label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                        <Input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={handleFileChange}
                                            accept="image/*,.pdf"
                                            required
                                        />
                                        <div className="flex flex-col items-center">
                                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                            {formData.document ? (
                                                <p className="text-primary font-medium">{formData.document.name}</p>
                                            ) : (
                                                <>
                                                    <p className="font-medium">Click to upload document</p>
                                                    <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG, PDF (Max 5MB)</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)} disabled={loading}>
                                        Back
                                    </Button>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : "Submit Request"}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {step === 3 && (
                            <div className="text-center py-8">
                                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Request Submitted!</h2>
                                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                                    Your request to become a verified seller has been sent to our admin team.
                                    We typically review requests within 24-48 hours. You will be notified once approved.
                                </p>
                                <Button onClick={onBack}>Return to Dashboard</Button>
                            </div>
                        )}
                    </>
                )}
            </Card>
        </div>
    );
};
export default SellerVerification;
