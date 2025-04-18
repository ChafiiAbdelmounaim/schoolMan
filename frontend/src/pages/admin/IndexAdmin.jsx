import { useState } from "react";
import { NavLink } from "react-router-dom";

const sidebarItems = [
    { name: "Analytics", icon: "fas fa-chart-line" },
    { name: "Students", icon: "fas fa-users" },
    { name: "Teachers", icon: "fas fa-chalkboard-teacher" },
    { name: "Classrooms", icon: "fas fa-door-open" },
    { name: "Subjects", icon: "fas fa-book" },
    { name: "Filiers", icon: "fas fa-layer-group" },
    { name: "Years", icon: "fas fa-calendar" },
    { name: "Semesters", icon: "fas fa-calendar-alt" }
];

function IndexAdmin() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div
                className={`bg-gray-800 text-white p-4 space-y-4 fixed h-full transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-16'}`}
            >
                {/* Button to toggle sidebar */}
                <button
                    onClick={toggleSidebar}
                    className="absolute top-4 right-4 text-white z-50"
                >
                    {isSidebarOpen ? (
                        <i className="fas fa-times"></i>  // FontAwesome close icon
                    ) : (
                        <i className="fas fa-bars"></i>  // FontAwesome menu icon
                    )}
                </button>

                {/* Sidebar Title or Icon */}
                <div className="flex items-center mb-6">
                    {isSidebarOpen ? (
                        <h2 className="text-xl font-bold">Admin Panel</h2>
                    ) : (
                        <i className="fas fa-cogs text-2xl"></i>  // FontAwesome icon when sidebar is closed
                    )}
                </div>

                <nav className="mt-4">
                    {sidebarItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={`/${item.name.toLowerCase()}`}
                            className={({ isActive }) =>
                                `flex items-center py-2 px-4 rounded-md hover:bg-gray-700 transition ${isActive ? "bg-gray-700" : ""}`
                            }
                        >
                            {/* Icon */}
                            <i className={`${item.icon} mr-3`}></i>
                            {/* Text (only visible when sidebar is open) */}
                            {isSidebarOpen && <span>{item.name}</span>}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Content Area */}
            <div className={`flex-1 p-8 overflow-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <h1>Welcome to the Admin Panel!</h1>
                {/* Your page content goes here */}
            </div>
        </div>
    );
}

export default IndexAdmin;
