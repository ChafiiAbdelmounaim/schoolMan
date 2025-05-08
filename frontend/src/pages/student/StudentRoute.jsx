import { Navigate } from "react-router";
import useAuth from "../../hooks/useAuth.js";

export const StudentRoute = ({ children }) => {
    const { user, role } = useAuth();

    if (!user || role !== 'student') {
        return <Navigate to="/login" />;
    }

    return children;
};