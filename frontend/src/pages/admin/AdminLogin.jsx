import { useState } from "react";
import { z } from "zod";
import { useNavigate } from "react-router";
import useAuth from "../../hooks/useAuth.js";
import { Eye, EyeOff } from "lucide-react";

import FormItem from "../../components/form/FormItem.jsx";
import Input from "../../components/form/Input.jsx";
import FormMessage from "../../components/form/FormMessage.jsx";
import FormControl from "../../components/form/FormControl.jsx";
import FormLabel from "../../components/form/FormLabel.jsx";

function AdminLogin() {
    const { error, login, user } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

    const loginSchema = z.object({
        email: z.string().email({ message: "Please enter a valid email" }),
        password: z.string()
            .min(8, { message: "Password must be at least 8 characters long" })
            .regex(/[A-Z]/, { message: "Password must contain an uppercase letter" })
            .regex(/[a-z]/, { message: "Password must contain a lowercase letter" })
            .regex(/\d/, { message: "Password must contain a number" }),
    });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        const result = loginSchema.safeParse({ email, password });

        if (!result.success) {
            setErrorMessage(result.error.issues[0]?.message || "Invalid input");
            setIsLoading(false);
        } else {
            setErrorMessage("");
            login({ email, password })
                .then((response) => {
                    if (response.role === 'user') {
                        navigate("/students");
                    }else if(response.role === 'teacher'){
                        navigate("/teacher/dashboard");
                    }else if(response.role === 'student'){
                        navigate("/student/dashboard");
                    } else {
                        setErrorMessage("Access denied. Admin login only.");
                    }
                })
                .catch((err) => setErrorMessage(err.message || "Authentication failed"))
                .finally(() => setIsLoading(false));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand Section */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <i className="fas fa-graduation-cap text-2xl text-white"></i>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">EduSystem</h1>
                    <p className="text-gray-600 text-sm">Smart School Management Platform</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
                        <p className="text-gray-600 text-sm">Sign in to access your dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i className="fas fa-envelope text-gray-400"></i>
                                </div>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                />
                                {email && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <i className="fas fa-check text-green-500"></i>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i className="fas fa-lock text-gray-400"></i>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            {/* Password Requirements Toggle */}
                            <div className="mt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordRequirements(!showPasswordRequirements)}
                                    className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium"
                                >
                                    <i className={`fas fa-chevron-${showPasswordRequirements ? 'up' : 'down'} text-xs`}></i>
                                    Password Requirements
                                    <i className="fas fa-info-circle"></i>
                                </button>

                                {showPasswordRequirements && (
                                    <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                        <ul className="text-xs text-blue-700 space-y-2">
                                            <li className="flex items-center gap-2">
                                                <i className="fas fa-check text-blue-500 text-xs"></i>
                                                At least 8 characters long
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <i className="fas fa-check text-blue-500 text-xs"></i>
                                                Contains at least 1 number
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <i className="fas fa-check text-blue-500 text-xs"></i>
                                                Contains at least 1 capital letter
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <i className="fas fa-check text-blue-500 text-xs"></i>
                                                Contains at least 1 small letter
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Error Message */}
                        {(errorMessage || error?.message) && (
                            <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                        <i className="fas fa-exclamation-triangle text-red-600"></i>
                                    </div>
                                    <span className="text-sm font-medium text-red-800">{errorMessage || error?.message}</span>
                                </div>
                            </div>
                        )}

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                                isLoading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 hover:scale-105 shadow-lg hover:shadow-blue-500/25'
                            } text-white`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    <span>Signing In...</span>
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-sign-in-alt"></i>
                                    <span>Sign In</span>
                                </>
                            )}
                        </button>

                        {/* Forgot Password */}
                        <div className="text-center">
                            <button
                                type="button"
                                className="text-blue-600 hover:text-blue-800 text-sm transition-colors duration-200 font-medium"
                            >
                                Forgot My Password?
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 space-y-4">
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                        <button className="hover:text-gray-700 transition-colors duration-200">Terms of Use</button>
                        <span>|</span>
                        <button className="hover:text-gray-700 transition-colors duration-200">Privacy Policy</button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default AdminLogin;