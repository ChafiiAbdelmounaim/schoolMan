import useAuth from "../../hooks/useAuth.js";
import { Navigate } from "react-router";

export function GuestOnlyRoute({ children }) {
    const { user } = useAuth();

    if (user) {
        return <Navigate to="/" />; // or to a dashboard if you have one
    }

    return children;
}
