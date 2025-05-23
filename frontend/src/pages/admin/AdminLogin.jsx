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
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-16 p-6 border rounded-md shadow-md">
            <h2 className="text-2xl font-bold text-center mb-8">Admin Login</h2>
            <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                    <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </FormControl>
            </FormItem>
            <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                    <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        className="absolute right-2 top-2 text-gray-600 hover:text-gray-800"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </FormControl>
            </FormItem>
            <FormMessage message={errorMessage || error?.message} />
            <button
                type="submit"
                className="bg-gray-800 text-white p-2 rounded-md mt-4 w-full hover:bg-blue-700 flex items-center justify-center"
                disabled={isLoading}
            >
                {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-gray-400 mr-2"></div>
                ) : null}
                {isLoading ? "Loading..." : "Login"}
            </button>
        </form>
    );
}

export default AdminLogin;