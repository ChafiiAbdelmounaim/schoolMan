import { Link, Outlet, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth.js";

export function Navigation() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Dark mode state
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });

    // Language state
    const [currentLanguage, setCurrentLanguage] = useState(() => {
        return localStorage.getItem('language') || 'en';
    });

    // Language dropdown state
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

    const handleLogout = function() {
        logout().then(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        });
    };

    // Dark mode toggle
    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);
        localStorage.setItem('darkMode', newDarkMode.toString());

        // Apply dark mode to document
        if (newDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // Language change handler
    const changeLanguage = (lang) => {
        setCurrentLanguage(lang);
        localStorage.setItem('language', lang);
        setIsLanguageDropdownOpen(false);

        // Here you can add your language switching logic
        // For example, i18n.changeLanguage(lang);
    };

    // Languages configuration
    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'ar', name: 'العربية', flag: '🇸🇦' }
    ];

    const currentLangObj = languages.find(lang => lang.code === currentLanguage);

    // Apply dark mode on component mount
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    return (
        <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                            <i className="fas fa-graduation-cap text-white text-lg"></i>
                        </div>
                        <span className="text-2xl font-bold text-gray-800 dark:text-white">
                            EduSystem
                        </span>
                    </div>


                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-4">


                        {/* Login Button (only show if not logged in) */}
                        {!user && (
                            <Link
                                to="/login"
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                            >
                                Sign In
                            </Link>
                        )}

                        {/* Logout Button (only show if logged in) */}
                        {user && (
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                            >
                                Logout
                            </button>
                        )}

                        {/* Mobile Menu Button */}
                        <button className="md:hidden w-10 h-10 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl flex items-center justify-center transition-all duration-300">
                            <i className="fas fa-bars text-gray-600 dark:text-gray-300"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Click outside to close language dropdown */}
            {isLanguageDropdownOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsLanguageDropdownOpen(false)}
                ></div>
            )}
        </nav>
    );
}