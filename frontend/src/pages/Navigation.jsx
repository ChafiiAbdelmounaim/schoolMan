import {Link, Outlet, useNavigate} from "react-router";
import useAuth from "../hooks/useAuth.js";
import Switch from "../components/Switch.jsx";


export function Navigation() {
    const {user,logout} = useAuth()
    const navigate = useNavigate()

    const handleLogout = function(){
        logout().then(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        });
    }

    return (
        <nav className="bg-gray-800 p-4 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo or Brand Name */}
                <div className="text-white text-2xl font-bold">
                    Berterbiev.
                </div>

                {/* Navigation Links */}
                <ul className="flex space-x-6">
                    <li className="text-white hover:text-gray-300" >
                        <Link to={'/'} >Home</Link>
                    </li>
                    <li className="text-white hover:text-gray-300" >
                        <Link to={'/login'} >Login</Link>
                    </li>
                    <li className="text-white hover:text-gray-300">
                        <Link to={'/register'} >Register</Link>
                    </li>
                    <li className="text-white hover:text-gray-300">
                        <Link to={'/users'} >Users</Link>
                    </li>
                </ul>

                <div className="flex space-x-6" >
                    <form className="text-white hover:text-gray-300 d-flex" role="search">
                        {user && <button type={'button'} onClick={handleLogout}  className="btn btn-outline-success" >Logout</button>}
                        { !user && <Link to={"/login"} className="btn btn-outline-success" >Login</Link>}

                    </form>
                    {/* Dark Mode Toggle */}
                    {/*<button className="bg-white text-gray-800 px-4 py-1 rounded hover:bg-gray-300 transition-colors">*/}
                    {/*    DARK MODE*/}
                    {/*</button>*/}
                    <Switch/>
                </div>
            </div>
        </nav>

    )
}
