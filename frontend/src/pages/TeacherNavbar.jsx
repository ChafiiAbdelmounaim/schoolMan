import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import NotificationBell from "../components/NotificationBell.jsx";

const TeacherNavbar = () => {
    const { user, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const navigate = useNavigate();
    const handleLogout = () => {
        logout().then(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        });
    };

    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    return (
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
            {/* Left-aligned branding/home link */}
            <div className="flex items-center">
                <button
                    className="flex items-center text-lg font-semibold hover:text-gray-300 transition-colors"
                    onClick={() => navigate("/teacher/dashboard")}
                >
                    <i className="fas fa-chalkboard-teacher mr-2"></i>
                    TeacherSpace
                </button>
            </div>

            {/* Right-aligned navigation items */}
            <div className="flex items-center space-x-4 relative">

                {/* Announcements Icon */}
                <button
                    className="p-2 text-xl hover:text-gray-300 transition-colors"
                    aria-label="View schedule"
                    onClick={() => navigate("/teacher/announcements")}
                >
                    <i className="fa-duotone fa-solid fa-bullhorn"></i>
                </button>

                {/* Schedule Icon */}
                <button
                    className="p-2 text-xl hover:text-gray-300 transition-colors"
                    aria-label="View schedule"
                    onClick={() => navigate("/teacher/timetable")}
                >
                    <i className="fas fa-calendar-alt"></i>
                </button>

                {/* Grades/Assignments Icon */}
                <button
                    className="p-2 text-xl hover:text-gray-300 transition-colors"
                    aria-label="Grades and assignments"
                    onClick={() => navigate("/teacher/classes")}
                >
                    <i className="fas fa-book-open"></i>
                </button>

                {/* Notifications Bell - New Component */}
                <NotificationBell userType="teacher" />

                {/* Profile Dropdown */}
                <button
                    onClick={toggleProfile}
                    className="p-2 text-xl rounded-full hover:bg-gray-600 transition-colors"
                    aria-label="User profile"
                >
                    <i className="fas fa-user"></i>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                    <div className="absolute top-12 right-0 w-64 bg-white text-black shadow-xl rounded-lg p-4 z-50 border border-gray-200">
                        <div className="text-center border-b pb-3">
                            <h2 className="text-lg font-bold">
                                {user?.full_name || "Teacher"}
                            </h2>
                            <span className="bg-gray-800 text-white text-xs font-semibold px-2 py-1 rounded-md">
                                Teacher
                            </span>
                            {user?.subjects && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Subjects: {user.subjects.join(", ")}
                                </p>
                            )}
                        </div>
                        <div className="mt-4 space-y-2">
                            <button
                                className="flex items-center w-full p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                onClick={() => navigate("/teacher/timetable")}
                            >
                                <i className="fas fa-calendar-alt mr-2"></i> My Schedule
                            </button>
                            <button
                                className="flex items-center w-full p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                onClick={() => navigate("/teacher/classes")}
                            >
                                <i className="fas fa-book-open mr-2"></i> My Classes
                            </button>

                            <button
                                className="flex items-center w-full p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                onClick={() => navigate("/teacher/announcements")}
                            >
                                <i className="fa-duotone fa-solid fa-bullhorn mr-2"></i> Announcements
                            </button>

                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                <i className="fas fa-sign-out-alt mr-2"></i> Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherNavbar;