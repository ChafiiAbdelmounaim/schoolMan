import { useState, useEffect } from "react";
import { z } from "zod";
import { Eye, EyeOff, User, Mail, Lock, Save, ArrowLeft, Shield } from "lucide-react";
import useAuth from "../../hooks/useAuth.js";

function AccountSettings() {
    const { user, updateUserProfile, updateUserPassword, getUserProfile, loading, role } = useAuth();

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [activeTab, setActiveTab] = useState("profile");

    // Check if user is authorized (admin/user only)
    const isAuthorized = role === 'user';

    // Load user data on component mount
    useEffect(() => {
        if (!isAuthorized) {
            setErrors({ general: "Access denied. Account settings are only available for administrators." });
            return;
        }

        const loadUserProfile = async () => {
            try {
                await getUserProfile();
            } catch (error) {
                console.error('Failed to load user profile:', error);
                setErrors({ general: error.message || "Failed to load profile data." });
            }
        };

        loadUserProfile();
    }, [isAuthorized, getUserProfile]);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || "",
                email: user.email || ""
            }));
        }
    }, [user]);

    // Validation schemas
    const profileSchema = z.object({
        name: z.string().min(2, "Name must be at least 2 characters long"),
        email: z.string().email("Please enter a valid email address")
    });

    const passwordSchema = z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string()
            .min(8, "Password must be at least 8 characters long")
            .regex(/[A-Z]/, "Password must contain an uppercase letter")
            .regex(/[a-z]/, "Password must contain a lowercase letter")
            .regex(/\d/, "Password must contain a number"),
        confirmPassword: z.string()
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"]
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear specific field error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
        setSuccessMessage("");
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleProfileUpdate = async () => {
        if (!isAuthorized) {
            setErrors({ general: "Access denied. Profile updates are only allowed for administrators." });
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const profileData = {
                name: formData.name,
                email: formData.email
            };

            const result = profileSchema.safeParse(profileData);

            if (!result.success) {
                const fieldErrors = {};
                result.error.issues.forEach(issue => {
                    fieldErrors[issue.path[0]] = issue.message;
                });
                setErrors(fieldErrors);
                return;
            }

            // Call the backend API
            await updateUserProfile(profileData);

            setSuccessMessage("Profile updated successfully!");

        } catch (error) {
            setErrors({ general: error.message || "Failed to update profile. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordUpdate = async () => {
        if (!isAuthorized) {
            setErrors({ general: "Access denied. Password updates are only allowed for administrators." });
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const passwordData = {
                current_password: formData.currentPassword,
                new_password: formData.newPassword,
                confirm_password: formData.confirmPassword
            };

            const result = passwordSchema.safeParse({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword
            });

            if (!result.success) {
                const fieldErrors = {};
                result.error.issues.forEach(issue => {
                    fieldErrors[issue.path[0]] = issue.message;
                });
                setErrors(fieldErrors);
                return;
            }

            // Call the backend API
            await updateUserPassword(passwordData);

            setSuccessMessage("Password updated successfully!");
            setFormData(prev => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            }));

        } catch (error) {
            setErrors({ general: error.message || "Failed to update password. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <button className="p-2 hover:bg-white rounded-lg transition-colors duration-200">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>
                            <p className="text-gray-600 mt-1">Manage your profile information and security settings</p>
                        </div>
                    </div>
                </div>

                {/* User Info Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : "Admin User"}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="bg-gray-800 text-white text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    {role === 'user' ? 'Administrator' : role === 'teacher' ? 'Teacher' : role === 'student' ? 'Student' : 'User'}
                                </span>
                                <span className="text-sm text-gray-500">Member ID: A{user?.id || '0001'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Tabs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab("profile")}
                                className={`px-6 py-4 font-medium text-sm transition-colors duration-200 border-b-2 ${
                                    activeTab === "profile"
                                        ? "border-blue-500 text-blue-600 bg-blue-50"
                                        : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Profile Information
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab("security")}
                                className={`px-6 py-4 font-medium text-sm transition-colors duration-200 border-b-2 ${
                                    activeTab === "security"
                                        ? "border-blue-500 text-blue-600 bg-blue-50"
                                        : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    Security & Password
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-8">
                        {/* Access Denied Message for Non-Admins */}
                        {!isAuthorized && (
                            <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-red-800 mb-1">Access Restricted</h3>
                                        <p className="text-sm text-red-700">
                                            Account settings are only available for administrators.
                                            {role === 'teacher' && ' Teachers should contact the administrator for profile changes.'}
                                            {role === 'student' && ' Students should contact the administrator for profile changes.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Success Message */}
                        {successMessage && isAuthorized && (
                            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <i className="fas fa-check text-green-600"></i>
                                    </div>
                                    <span className="text-sm font-medium text-green-800">{successMessage}</span>
                                </div>
                            </div>
                        )}

                        {/* General Error Message */}
                        {errors.general && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                        <i className="fas fa-exclamation-triangle text-red-600"></i>
                                    </div>
                                    <span className="text-sm font-medium text-red-800">{errors.general}</span>
                                </div>
                            </div>
                        )}

                        {/* Content - Only show if authorized */}
                        {isAuthorized && (
                            <>
                                {/* Profile Information Tab */}
                                {activeTab === "profile" && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Name Field */}
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <User className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter your full name"
                                                        value={formData.name}
                                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                                                            errors.name ? "border-red-300" : "border-gray-200"
                                                        }`}
                                                    />
                                                </div>
                                                {errors.name && (
                                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                                        <i className="fas fa-exclamation-circle text-xs"></i>
                                                        {errors.name}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Email Field */}
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Mail className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="email"
                                                        placeholder="Enter your email address"
                                                        value={formData.email}
                                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                                                            errors.email ? "border-red-300" : "border-gray-200"
                                                        }`}
                                                    />
                                                </div>
                                                {errors.email && (
                                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                                        <i className="fas fa-exclamation-circle text-xs"></i>
                                                        {errors.email}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Update Profile Button */}
                                        <div className="pt-4">
                                            <button
                                                onClick={handleProfileUpdate}
                                                disabled={isLoading || loading}
                                                className={`px-6 py-3 font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 ${
                                                    (isLoading || loading)
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 hover:scale-105 shadow-lg hover:shadow-blue-500/25'
                                                } text-white`}
                                            >
                                                {(isLoading || loading) ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                                        <span>Updating...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-5 h-5" />
                                                        <span>Update Profile</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Security & Password Tab */}
                                {activeTab === "security" && (
                                    <div className="space-y-6">
                                        {/* Current Password */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">Current Password</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Lock className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type={showPasswords.current ? "text" : "password"}
                                                    placeholder="Enter your current password"
                                                    value={formData.currentPassword}
                                                    onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                                                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                                                        errors.currentPassword ? "border-red-300" : "border-gray-200"
                                                    }`}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                                    onClick={() => togglePasswordVisibility("current")}
                                                >
                                                    {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                            {errors.currentPassword && (
                                                <p className="text-sm text-red-600 flex items-center gap-1">
                                                    <i className="fas fa-exclamation-circle text-xs"></i>
                                                    {errors.currentPassword}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* New Password */}
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">New Password</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Lock className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type={showPasswords.new ? "text" : "password"}
                                                        placeholder="Enter new password"
                                                        value={formData.newPassword}
                                                        onChange={(e) => handleInputChange("newPassword", e.target.value)}
                                                        className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                                                            errors.newPassword ? "border-red-300" : "border-gray-200"
                                                        }`}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                                        onClick={() => togglePasswordVisibility("new")}
                                                    >
                                                        {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </button>
                                                </div>
                                                {errors.newPassword && (
                                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                                        <i className="fas fa-exclamation-circle text-xs"></i>
                                                        {errors.newPassword}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Confirm Password */}
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Lock className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type={showPasswords.confirm ? "text" : "password"}
                                                        placeholder="Confirm new password"
                                                        value={formData.confirmPassword}
                                                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                                        className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                                                            errors.confirmPassword ? "border-red-300" : "border-gray-200"
                                                        }`}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                                        onClick={() => togglePasswordVisibility("confirm")}
                                                    >
                                                        {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </button>
                                                </div>
                                                {errors.confirmPassword && (
                                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                                        <i className="fas fa-exclamation-circle text-xs"></i>
                                                        {errors.confirmPassword}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Password Requirements */}
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                            <h4 className="text-sm font-medium text-blue-800 mb-3">Password Requirements:</h4>
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
                                                    Contains at least 1 lowercase letter
                                                </li>
                                            </ul>
                                        </div>

                                        {/* Update Password Button */}
                                        <div className="pt-4">
                                            <button
                                                onClick={handlePasswordUpdate}
                                                disabled={isLoading || loading}
                                                className={`px-6 py-3 font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 ${
                                                    (isLoading || loading)
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 hover:scale-105 shadow-lg hover:shadow-blue-500/25'
                                                } text-white`}
                                            >
                                                {(isLoading || loading) ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                                        <span>Updating...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Shield className="w-5 h-5" />
                                                        <span>Update Password</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AccountSettings;