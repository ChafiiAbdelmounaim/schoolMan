import { useState } from "react";
import {toggleSidebar} from "../store/sidebarSlice.js";
import {useDispatch, useSelector} from "react-redux";
import useAuth from "../hooks/useAuth.js";

const AdminNavbar = () => {

    const {user,logout} = useAuth()
    const dispatch = useDispatch();
    const isSidebarOpen = useSelector((state) => state.sidebar.isSidebarOpen);

    const [darkMode, setDarkMode] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false); // Manage popup visibility

    const handleLogout = function(){
        logout().then(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        });
    }
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.body.classList.toggle("dark", !darkMode); // Toggle dark mode on body element
    };

    // Handle clicking on user icon to toggle popup
    const togglePopup = () => {
        setIsPopupOpen(!isPopupOpen);
    };

    const printToken = () => {
        console.log("User : ", user, "\nToken : ", localStorage.getItem('token'))
    }


    return (
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">

            {/* Button to toggle sidebar */}
            <button
                onClick={() => dispatch(toggleSidebar())}
                className="p-2 text-xl"
            >
                {isSidebarOpen ? (
                    <i className="fas fa-times"></i>  // FontAwesome close icon
                ) : (
                    <i className="fas fa-bars"></i>  // FontAwesome menu icon
                )}
            </button>


            {/* Right Section: Notifications, Messages, User Name */}
            <div className="flex items-center space-x-4 relative">
                {/* Left Section: Dark Mode Toggle */}
                {/*<button*/}
                {/*    onClick={toggleDarkMode}*/}
                {/*    className="p-2 text-xl"*/}
                {/*>*/}
                {/*    <i className={darkMode ? "fas fa-sun" : "fas fa-moon"}></i> /!* Dark Mode Toggle Icon *!/*/}
                {/*</button>*/}

                {/*/!* Notification Icon *!/*/}
                {/*<button className="p-2 text-xl">*/}
                {/*    <i className="fas fa-bell"></i>*/}
                {/*</button>*/}

                {/*/!* Message Icon *!/*/}
                {/*<button className="p-2 text-xl">*/}
                {/*    <i className="fas fa-comment"></i>*/}
                {/*</button>*/}

                {/* Person Icon (click to toggle popup) */}
                <button
                    onClick={togglePopup}
                    className="p-2 text-xl rounded-full"
                >
                    <i className="fas fa-user"></i> {/* FontAwesome person icon */}
                </button>

                {/* Popup (show user name and logout button) */}
                {isPopupOpen && (
                    <div className="absolute top-12 right-0 w-64 bg-white text-black shadow-lg rounded-lg p-4 z-50">
                        <div className="text-center border-b pb-3">
                            <h2 className="text-lg font-bold">{user.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : ""}</h2>
                            <span className="bg-gray-800 text-white text-xs font-semibold px-2 py-1 rounded-md">Administator</span>
                            <p className="text-sm text-gray-500 mt-1">Member ID: 18715</p>
                        </div>
                        <div className="mt-4 space-y-2">
                            <button className="flex items-center w-full p-2 text-gray-700 hover:bg-gray-100 rounded-md" onClick={printToken}>
                                <i className="fas fa-user-cog mr-2"></i> Account Settings
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                            >
                                <i className="fas fa-power-off mr-2"></i> Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminNavbar;
