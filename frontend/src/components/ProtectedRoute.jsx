import useAuth from "../hooks/useAuth.js";
import {Navigate, useNavigate} from "react-router";

export function ProtectedRoute({children}) {
    const {user} = useAuth()
    const navigate = useNavigate()
    return (
        <>
            {user ? children : <Navigate  to={'/login'} />}
        </>
    )
}
