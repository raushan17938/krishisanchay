import { useState, useEffect, useRef } from "react";
import { verifyOtp } from "../api/auth";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const VerifyOtp = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");
    const mode = searchParams.get("mode") || "reset"; // 'reset' or 'signup'

    // OTP State as array of 6 strings
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [isLoading, setIsLoading] = useState(false);

    // Refs for inputs to manage focus
    const inputRefs = useRef([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!email) {
            toast.error("Error", { description: "Email missing. Please try again." });
            navigate(mode === "reset" ? "/forgot-password" : "/signup");
        }
    }, [email, navigate, mode]);

    const handleChange = (index, e) => {
        const value = e.target.value;
        if (isNaN(value)) return;

        const newOtp = [...otp];
        // Allow only last digit if user types in already filled box without selecting
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Move to next input if value is entered
        if (value && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Move to previous input on backspace if current is empty
        if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const clipboardData = e.clipboardData.getData("text");
        const numbers = clipboardData.replace(/\D/g, "").slice(0, 6).split("");

        if (numbers.length === 0) return;

        const newOtp = [...otp];
        numbers.forEach((num, i) => {
            if (i < 6) newOtp[i] = num;
        });
        setOtp(newOtp);

        // Focus the next empty box or the last one
        const nextFocusInfo = numbers.length < 6 ? numbers.length : 5;
        if (inputRefs.current[nextFocusInfo]) {
            inputRefs.current[nextFocusInfo].focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpValue = otp.join("");
        if (otpValue.length !== 6) {
            toast.error("Invalid Code", { description: "Please enter a valid 6-digit code." });
            return;
        }
        setIsLoading(true);

        try {
            if (mode === 'signup') {
                // Email Verification Flow
                const { verifyEmail } = await import("../api/auth"); // Dynamic import to avoid cycles or just use top level
                const data = await verifyEmail({ email, otp: otpValue });

                if (data.success) {
                    toast.success("Welcome!", {
                        description: "Email verified successfully. Please login."
                    });
                    // Redirect to login page
                    navigate('/login');
                }
            } else {
                // Password Reset Flow
                const data = await verifyOtp({ email, otp: otpValue });

                if (data.success) {
                    toast.success("Verified!", {
                        description: "Code valid. You can now reset your password."
                    });
                    navigate(`/reset-password?token=${data.resetToken}`);
                }
            }

        } catch (error) {
            console.error("Verification Error:", error);
            const errorMessage = error.response?.data?.message || "Invalid Code or Request Failed";
            toast.error("Verification Failed", {
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
                        <ShieldCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Enter Verification Code</h1>
                    <p className="text-sm text-muted-foreground">
                        We sent a code to <span className="font-medium text-gray-900">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2 text-center">
                        <Label htmlFor="otp" className="sr-only">OTP Code</Label>
                        <div className="flex justify-center gap-2">
                            {otp.map((data, index) => (
                                <Input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    maxLength={1}
                                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all rounded-lg"
                                    value={data}
                                    onChange={(e) => handleChange(index, e)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                />
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">Enter the 6-digit code from your email</p>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-600/20 transition-all font-medium"
                    >
                        {isLoading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                        ) : (
                            "Verify Code"
                        )}
                    </Button>
                </form>

                <div className="text-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-green-600 transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtp;
