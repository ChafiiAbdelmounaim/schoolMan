import useAuth from "../hooks/useAuth.js";
import {Navigate, useNavigate} from "react-router";

export function LoggedInRoute({children}) {
    const {user} = useAuth()
    const navigate = useNavigate()
    return (
        <>
            {user ? <Navigate  to={'/'} /> : children }
        </>
    )
}
