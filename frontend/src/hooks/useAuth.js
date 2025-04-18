import {useDispatch, useSelector} from "react-redux";
import {fetchUser, loginUser, logoutUser, registerUser} from "../store/authSlice.js";

const useAuth = function () {
    const { user, error,loading,token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const login = async (credentiels) => {
        return dispatch(loginUser(credentiels))
            .unwrap();
    }

    const register = async (data) => {
        return dispatch(registerUser(data))
            .unwrap();
    }
    const getUser = async () => {
        return dispatch(fetchUser())
            .unwrap();
    }

    const logout = async function () {
        return dispatch(logoutUser()).unwrap();
    }


    return {
        user,
        login,
        error,
        loading,
        token,
        register,
        getUser,
        logout,
    }
}
export default useAuth;
