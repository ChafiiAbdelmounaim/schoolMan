import { Navigate } from "react-router";
import useAuth from "../../hooks/useAuth.js";

export const TeacherRoute = ({ children }) => {
    const { user, role } = useAuth();

    if (!user || role !== 'teacher') {
        return <Navigate to="/login" />;
    }

    return children;
};