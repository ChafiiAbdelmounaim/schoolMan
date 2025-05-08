import useAuth from "../hooks/useAuth.js";
import {Navigate} from "react-router";

export function LoggedInRoute({children}) {
    const {user, role} = useAuth();

    // Determine redirect path based on user role
    const getRedirectPath = () => {
        if (!user) return null; // No redirection if not logged in

        switch (role) {
            case 'student':
                return '/student/dashboard';
            case 'teacher':
                return '/teacher/dashboard';
            default:
                return '/'; // Default redirect for admin or any other role
        }
    };

    const redirectPath = getRedirectPath();

    return (
        <>
            {user ? <Navigate to={redirectPath} /> : children}
        </>
    );
}