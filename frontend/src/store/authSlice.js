import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AuthService from "../services/AuthService.js";

// Helper function for safe localStorage parsing
const getParsedLocalStorageItem = (key) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error(`Error parsing localStorage item "${key}":`, error);
        return null;
    }
};

// Async thunks
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData, thunkAPI) => {
        try {
            const data = await AuthService.register(userData);
            return data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || error.message || 'Registration failed'
            );
        }
    }
);

export const registerTeacher = createAsyncThunk(
    'auth/registerTeacher',
    async (userData, thunkAPI) => {
        try {
            const data = await AuthService.registerTeacher(userData);
            return data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || error.message || 'Teacher registration failed'
            );
        }
    }
);

export const registerStudent = createAsyncThunk(
    'auth/registerStudent',
    async (userData, thunkAPI) => {
        try {
            const data = await AuthService.registerStudent(userData);
            return data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || error.message || 'Student registration failed'
            );
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials, thunkAPI) => {
        try {
            const data = await AuthService.login(credentials);
            return data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || error.message || 'Login failed'
            );
        }
    }
);

export const fetchUser = createAsyncThunk(
    'auth/fetchUser',
    async (_, thunkAPI) => {
        try {
            const data = await AuthService.fetchUser();
            return data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || error.message || 'Fetching user failed'
            );
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, thunkAPI) => {
        return true;
    }
);

const initialState = {
    token: localStorage.getItem('token') || null,
    user: getParsedLocalStorageItem('user'),
    role: localStorage.getItem('role') || null,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Registration
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.access_token;
                state.user = action.payload.user;
                state.role = action.payload.role;
                // Save to localStorage handled by AuthService
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Teacher Registration
            .addCase(registerTeacher.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerTeacher.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.access_token;
                state.user = action.payload.user;
                state.role = action.payload.role;
                // Save to localStorage handled by AuthService
            })
            .addCase(registerTeacher.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Student Registration
            .addCase(registerStudent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerStudent.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.access_token;
                state.user = action.payload.user;
                state.role = action.payload.role;
                // Save to localStorage handled by AuthService
            })
            .addCase(registerStudent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.access_token;
                state.user = action.payload.user;
                state.role = action.payload.role;
                // Save to localStorage handled by AuthService
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch User
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.role = action.payload.role;
                // Save to localStorage handled by AuthService
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Logout
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.token = null;
                state.user = null;
                state.role = null;
                // Remove from localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('role');
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;