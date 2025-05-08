import axios from "axios";

class AuthService {
    constructor() {
        this.axios = axios.create({
            baseURL: "http://localhost:8000/api",
        });
    }

    async login(credentials) {
        const response = await this.axios.post("/login", credentials);
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("role", response.data.role);
        return response.data;
    }

    async register(credentials) {
        const response = await this.axios.post("/register", credentials);
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("role", response.data.role);
        return response.data;
    }

    async fetchUser() {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const response = await axios.get("http://localhost:8000/api/user", {
            headers: { Authorization: `Bearer ${token}` },
        });

        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("role", response.data.role);

        return response.data;
    }

    isTeacher() {
        return localStorage.getItem("role") === "teacher";
    }

    isUser() {
        return localStorage.getItem("role") === "user";
    }

    isStudent() {
        return localStorage.getItem("role") === "student";
    }

    getRole() {
        return localStorage.getItem("role");
    }
}

export default new AuthService();