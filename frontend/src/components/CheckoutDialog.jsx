import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { createCheckoutSession } from "../api/order";

// Initialize Stripe (Replace with your Publishable Key)
// Ideally this should be in an env, but for this task I will put a placeholder or ask user to fill it.
// Assuming the user will provide the key in .env, I'll access it there if Vite exposes it.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_TYooMQauvdEDq54NiTphI7jx");

export const CheckoutDialog = ({ isOpen, onOpenChange, cartItems, totalAmount }) => {
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: 'India'
    });

    const handleCheckout = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Initiate Stripe Checkout Session
            const response = await createCheckoutSession({
                products: cartItems,
                shippingAddress: address
            });

            // Redirect to Stripe
            if (response.url) {
                window.location.href = response.url;
            } else {
                console.error("No redirect URL found");
                toast.error("Failed to start payment session");
            }

            // Alternative: use stripe.redirectToCheckout if URL isn't direct (but session.url is standard)
            // const stripe = await stripePromise;
            // await stripe.redirectToCheckout({ sessionId: response.id });

        } catch (error) {
            console.error("Checkout Error:", error);
            toast.error(error.response?.data?.message || "Failed to initiate checkout");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Secure Checkout</DialogTitle>
                    <DialogDescription>
                        Enter your delivery details to proceed to payment.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCheckout} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                required
                                value={address.address}
                                onChange={e => setAddress({ ...address, address: e.target.value })}
                                placeholder="123 Farm Road"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    required
                                    value={address.city}
                                    onChange={e => setAddress({ ...address, city: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pincode">Pin Code</Label>
                                <Input
                                    id="pincode"
                                    required
                                    value={address.postalCode}
                                    onChange={e => setAddress({ ...address, postalCode: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="text-xl font-bold text-center pt-2">
                        Total to Pay: ₹{totalAmount.toLocaleString()}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full btn-farm">
                            {loading ? "Redirecting to Stripe..." : "Proceed to Payment"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
