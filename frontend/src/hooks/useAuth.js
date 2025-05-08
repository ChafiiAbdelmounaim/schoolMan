import {useDispatch, useSelector} from "react-redux";
import {
    fetchUser,
    loginUser,
    logoutUser,
    registerUser,
    registerTeacher,
    registerStudent
} from "../store/authSlice.js";

const useAuth = function () {
    const { user, error, loading, token, role } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const login = async (credentials) => {
        return dispatch(loginUser(credentials))
            .unwrap();
    };

    const register = async (data) => {
        return dispatch(registerUser(data))
            .unwrap();
    };

    const registerAsTeacher = async (data) => {
        return dispatch(registerTeacher(data))
            .unwrap();
    };

    const registerAsStudent = async (data) => {
        return dispatch(registerStudent(data))
            .unwrap();
    };

    const getUser = async () => {
        return dispatch(fetchUser())
            .unwrap();
    };

    const logout = async function () {
        return dispatch(logoutUser()).unwrap();
    };

    const isTeacher = () => {
        return role === 'teacher';
    };

    const isUser = () => {
        return role === 'user';
    };

    const isStudent = () => {
        return role === 'student';
    };

    return {
        user,
        login,
        error,
        loading,
        token,
        role,
        register,
        registerAsTeacher,
        registerAsStudent,
        getUser,
        logout,
        isTeacher,
        isUser,
        isStudent
    };
};

export default useAuth;