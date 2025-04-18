import { useSelector } from "react-redux";
import { Outlet } from "react-router";
import AdminNavbar from "./AdminNavbar.jsx";
import {Navigation} from "./Navigation.jsx";
import SideBar from "./SideBar.jsx";

const Layout = () => {

    // Fetch authentication state from Redux store
    const token = useSelector((state) => state.auth.token);
    const user = useSelector((state) => state.auth.user);

    // Define the variables
    const isAuthenticated = !!token;
    const userName = user ? user.name : "Guest";

    const printSlice = () => {
        console.log("isAUth : ", isAuthenticated)
        // console.log("user : ", localStorage.getItem('user'))
    }

    
    const isSidebarOpen = useSelector((state) => state.sidebar.isSidebarOpen);
    const cssAdmin = `flex-1 p-8 overflow-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`

    return (
        <div className={isAuthenticated ? "flex h-screen" : ""}>

            {/*<button onClick={printSlice}> Helloooooo</button>*/}

            {isAuthenticated ? <SideBar/> : <Navigation/>}

            {/* Main Content Area */}
            <div className={isAuthenticated ? cssAdmin : ""}>
                {isAuthenticated ? <AdminNavbar/> : null}
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
