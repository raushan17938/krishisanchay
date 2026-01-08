import { useState, useEffect } from "react";
import { resetPassword } from "../api/auth";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            toast.error("Error", { description: "Invalid access. Please start over." });
            navigate("/forgot-password");
        }
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error("Weak Password", { description: "Password must be at least 6 characters." });
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Mismatch", { description: "Passwords do not match." });
            return;
        }

        setIsLoading(true);

        try {
            const data = await resetPassword({ password, resetToken: token });

            if (data.success) {
                toast.success("Success!", {
                    description: "Password reset successfully. Logging you in..."
                });

                // Store token and redirect to dashboard (simulating auto-login)
                localStorage.setItem("token", data.token);
                // Also store full user info for consistency
                localStorage.setItem("userInfo", JSON.stringify({ ...data.user, token: data.token }));

                setTimeout(() => {
                    navigate("/");
                }, 1500);
            } else {
                toast.error("Reset Failed", {
                    description: data.message || "Something went wrong"
                });
            }
        } catch (error) {
            console.error("Reset Password Error:", error);
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
                        <Lock className="w-6 h-6 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Set New Password 🔒</h1>
                    <p className="text-sm text-muted-foreground">
                        Create a strong password for your account.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Min 6 characters"
                            className="h-11"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Re-enter password"
                            className="h-11"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-600/20 transition-all font-medium mt-2"
                    >
                        {isLoading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...</>
                        ) : (
                            <><CheckCircle2 className="mr-2 h-4 w-4" /> Reset Password</>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
