import { Navigate } from "react-router";
import useAuth from "../../hooks/useAuth.js";


export const AdminRoute = ({ children }) => {
    const { user, role } = useAuth();

    if (!user || role !== 'user') {
        return <Navigate to="/login" />;
    }

    return children;
};