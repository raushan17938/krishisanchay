import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, CheckCircle, Store, Tractor } from "lucide-react";

const SellerVerification = ({ onBack }) => {
    const [step, setStep] = useState(1);
    const [userType, setUserType] = useState("farmer"); // farmer or shopkeeper
    const [formData, setFormData] = useState({
        phone: "",
        address: "",
        shopName: "",
        gstNumber: "",
        landSize: "",
        cropTypes: "",
        document: null
    });

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, document: e.target.files[0] });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call

        setStep(3); // Success step
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary" onClick={onBack}>
                ← Back to Dashboard
            </Button>

            <Card className="p-8">
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
                            <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)}>
                                Back
                            </Button>
                            <Button type="submit" className="w-full">
                                Submit Request
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
            </Card>
        </div>
    );
};

export default SellerVerification;
