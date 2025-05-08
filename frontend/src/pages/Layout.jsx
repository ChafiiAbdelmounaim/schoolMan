import { useSelector } from "react-redux";
import { Outlet } from "react-router";
import AdminNavbar from "./AdminNavbar.jsx";
import { Navigation } from "./Navigation.jsx";
import SideBar from "./SideBar.jsx";
import TeacherNavbar from "./TeacherNavbar.jsx";
import StudentNavbar from "./StudentNavbar.jsx";


const Layout = () => {
    // Fetch authentication state from Redux store
    const { token, user, role } = useSelector((state) => state.auth);
    const isSidebarOpen = useSelector((state) => state.sidebar.isSidebarOpen);

    // Derived state
    const isAuthenticated = !!token;
    const isUser = isAuthenticated && role === 'user';
    const isTeacher = isAuthenticated && role === 'teacher';
    const isStudent = isAuthenticated && role === 'student';

    // Dynamic classes - only apply sidebar margin for admin users
    const mainContentClass = isUser
        ? `flex-1 p-8 overflow-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`
        : "flex-1 p-8 overflow-auto";

    return (
        <div className={isAuthenticated ? "flex h-screen" : ""}>
            {/* Sidebar/Navigation */}
            {!isAuthenticated ? (
                <Navigation />
            ) : isUser ? (
                <SideBar />
            ) : null}

            {/* Main Content Area */}
            <div className={isAuthenticated ? mainContentClass : ""}>
                {/* Navbar */}
                {isUser && <AdminNavbar />}
                {isTeacher && <TeacherNavbar />}
                {isStudent && <StudentNavbar />}

                {/* Page Content */}
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;