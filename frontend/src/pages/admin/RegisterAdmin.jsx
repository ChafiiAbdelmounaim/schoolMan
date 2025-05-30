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

function RegisterAdmin() {
    const { error, register, getUser } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

    const registerSchema = z.object({
        name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
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
        const result = registerSchema.safeParse({ name, email, password });

        if (!result.success) {
            setErrorMessage(result.error.issues[0]?.message || "Invalid input");
            setIsLoading(false);
        } else {
            setErrorMessage("");
            register({ name, email, password })
                .then(() => getUser().then(() => navigate("/analytics")))
                .catch((err) => setErrorMessage(err.message || "Registration failed"))
                .finally(() => setIsLoading(false));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-16 p-6 border rounded-md shadow-md">
            <h2 className="text-2xl font-bold text-center mb-8">Add New Admin</h2>
            <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                    <Input
                        type="text"
                        placeholder="Enter admin name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </FormControl>
            </FormItem>
            <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                    <Input
                        type="email"
                        placeholder="Enter admin email"
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
                        placeholder="Enter the password"
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
                {/* Password Requirements Notice - Toggleable */}
                <div className="mt-2">
                    <button
                        type="button"
                        onClick={() => setShowPasswordRequirements(!showPasswordRequirements)}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        <i className={`fas fa-chevron-${showPasswordRequirements ? 'up' : 'down'} text-xs`}></i>
                        Password Requirements
                        <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
                    </button>

                    {showPasswordRequirements && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <ul className="text-xs text-blue-700 space-y-1">
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
                {isLoading ? "Loading..." : "Register admin"}
            </button>
        </form>
    );
}

export default RegisterAdmin;