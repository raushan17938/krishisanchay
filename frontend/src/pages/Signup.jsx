import { useState } from "react";
import { registerUser } from "../api/auth";
import { API_URL } from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Mail, Lock, User, Loader2, ArrowRight, Sprout, Github, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const Signup = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Validation Error", {
                description: "Passwords do not match."
            });
            return;
        }

        setIsLoading(true);

        try {
            // Exclude confirmPassword from API payload
            const { confirmPassword, ...signupData } = formData;
            const data = await registerUser(signupData);

            if (data.success) {
                toast.success("Account created!", {
                    description: "Please check your email for the verification code."
                });
                navigate(`/verify-otp?mode=signup&email=${encodeURIComponent(formData.email)}`);
            } else {
                toast.error("Signup failed", {
                    description: data.message || "Could not create account"
                });
            }
        } catch (error) {
            console.error("Signup Error:", error);
            const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
            toast.error("Error", {
                description: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        window.location.href = `${API_URL}/auth/${provider}`;
    };

    return (
        <div className="min-h-screen w-full flex flex-row-reverse">
            {/* Right Side - Hero/Visual (Reversed position for variety) */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-bl from-emerald-900 via-green-800 to-teal-900 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-green-950/80 to-transparent"></div>

                <div className="relative z-10 text-white max-w-lg text-right">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-xl ml-auto">
                        <Sprout className="w-8 h-8 text-green-400" />
                    </div>
                    <h1 className="text-5xl font-bold mb-6 leading-tight">Grow Your Future</h1>
                    <p className="text-xl text-green-100/80 leading-relaxed">
                        Connect with the best farming resources, experts, and markets. Start your journey with Krishi Sanchay today.
                    </p>
                </div>
            </div>

            {/* Left Side - Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                            <Leaf className="w-6 h-6 text-primary" />
                            <span className="font-bold text-xl">Krishi Sanchay</span>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
                        <p className="text-muted-foreground mt-2">Join our community of farmers and experts</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-5">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="name"
                                        placeholder="Enter your full name"
                                        className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all duration-300"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="email"
                                        placeholder="name@example.com"
                                        type="email"
                                        className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all duration-300"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a password"
                                        className="pl-10 pr-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all duration-300"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm your password"
                                        className="pl-10 pr-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all duration-300"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <Button className="w-full h-11 text-base shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700" type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> creating account...
                                    </>
                                ) : (
                                    <>
                                        Create Account <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <Button variant="outline" type="button" className="h-11 hover:bg-gray-50" onClick={() => handleSocialLogin('google')}>
                                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Google
                                </Button>
                                <Button variant="outline" type="button" className="h-11 hover:bg-gray-50" onClick={() => handleSocialLogin('github')}>
                                    <Github className="mr-2 h-4 w-4" />
                                    GitHub
                                </Button>
                            </div>

                            <p className="text-center text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link to="/login" className="font-semibold text-primary hover:underline underline-offset-4">
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
