import { useState } from "react";
import { forgotPassword } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, ArrowLeft, KeyRound } from "lucide-react";
import { toast } from "sonner";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = await forgotPassword(email);

            if (data.success) {
                toast.success("OTP Sent!", {
                    description: "Please check your email for the verification code."
                });
                navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
            } else {
                toast.error("Error", {
                    description: data.message || "Something went wrong"
                });
            }
        } catch (error) {
            console.error("Forgot Password Error:", error);
            const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
            toast.error("Network Error", {
                description: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1625246333195-bf7f85c44e36?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center relative">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10 p-8 space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <KeyRound className="w-6 h-6 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
                    <p className="text-sm text-muted-foreground">
                        No worries, we'll send you reset instructions.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-green-600 transition-colors" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                className="pl-10 h-11 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-600/20 transition-all font-medium"
                    >
                        {isLoading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                        ) : (
                            "Send Reset Code"
                        )}
                    </Button>
                </form>

                <div className="text-center">
                    <Link to="/login" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-green-600 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
