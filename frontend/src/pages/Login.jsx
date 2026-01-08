import { useState, useEffect } from "react";
import { loginUser, socialLogin, getMe } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Mail, Lock, Loader2, ArrowRight, Github } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Check for token in URL (from social login redirect)
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const token = query.get("token");
        const error = query.get("error");

        if (token) {
            localStorage.setItem("token", token);
            // Fetch user info to store in localStorage as well
            fetch('http://localhost:5001/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        localStorage.setItem("userInfo", JSON.stringify(data.data));
                        toast.success("Login Successful", {
                            description: "Welcome back!"
                        });
                        navigate("/");
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch user info", err);
                    toast.error("Login Failed", { description: "Could not retrieve user info" });
                });
        }

        if (error) {
            toast.error("Social Login Failed", {
                description: error.replaceAll('_', ' ')
            });
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = await loginUser({ email, password });

            if (data.success) {
                toast.success("Welcome back!", {
                    description: "You have successfully logged in."
                });
                // Store user data and token
                localStorage.setItem('userInfo', JSON.stringify(data));
                localStorage.setItem('token', data.token);

                // Add a small delay to ensure storage is updated before navigation
                setTimeout(() => {
                    navigate('/');
                }, 100);
            } else {
                toast.error("Login failed", {
                    description: data.message || "Invalid credentials"
                });
            }
        } catch (error) {
            console.error("Login Error:", error);
            const status = error.response?.status;
            const resData = error.response?.data;

            if (status === 401 && resData?.isUnverified) {
                toast.error("Verification Required", {
                    description: "Please verify your email address to continue."
                });
                navigate(`/verify-otp?mode=signup&email=${encodeURIComponent(email)}`);
                return;
            }

            const errorMessage = resData?.message || "Invalid credentials. Please try again.";
            toast.error("Login Failed", {
                description: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        window.location.href = `http://localhost:5001/api/auth/${provider}`;
    };

    return (
        <div className="min-h-screen w-full flex">
            {/* Left Side - Hero/Visual */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-900 via-green-800 to-green-900 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-bf7f85c44e36?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-green-950/80 to-transparent"></div>

                <div className="relative z-10 text-white max-w-lg">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-xl">
                        <Leaf className="w-8 h-8 text-green-400" />
                    </div>
                    <h1 className="text-5xl font-bold mb-6 leading-tight">Empowering Agriculture with AI</h1>
                    <p className="text-xl text-green-100/80 leading-relaxed">
                        Join thousands of farmers, buyers, and experts in the next generation of smart farming ecosystem.
                    </p>

                    <div className="mt-12 flex gap-4">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-green-900 bg-gray-200"></div>
                            ))}
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="font-bold text-lg">2,000+</span>
                            <span className="text-xs text-green-300">Active Farmers & Experts</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                            <Leaf className="w-6 h-6 text-primary" />
                            <span className="font-bold text-xl">Krishi Sanchay</span>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
                        <p className="text-muted-foreground mt-2">Enter your credentials to access your account</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="email"
                                        placeholder="name@example.com"
                                        type="email"
                                        className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all duration-300"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">Forgot password?</Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all duration-300"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <Button className="w-full h-11 text-base shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                                </>
                            ) : (
                                <>
                                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            className="h-11 hover:bg-gray-50"
                            onClick={() => handleSocialLogin('google')}
                            disabled={isLoading}
                        >
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
                        <Button
                            variant="outline"
                            className="h-11 hover:bg-gray-50"
                            onClick={() => handleSocialLogin('github')}
                            disabled={isLoading}
                        >
                            <Github className="mr-2 h-4 w-4" />
                            GitHub
                        </Button>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link to="/signup" className="font-semibold text-primary hover:underline underline-offset-4">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
