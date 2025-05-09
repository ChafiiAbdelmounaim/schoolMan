import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Helper function to get token
const getToken = () => localStorage.getItem('token');

// Helper function for local storage key
const getLocalStorageKey = () => {
    const role = localStorage.getItem('role') || 'guest';
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 'unknown';
    return `notifications_${role}_${userId}`;
};

// Helper to get cached notifications
const getCachedNotifications = () => {
    const key = getLocalStorageKey();
    try {
        return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {
        return [];
    }
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (_, thunkAPI) => {
        try {
            const token = getToken();
            if (!token) return [];

            const response = await axios.get('http://localhost:8000/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });

            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || error.message || 'Failed to fetch notifications'
            );
        }
    }
);

export const checkTimetableUpdates = createAsyncThunk(
    'notifications/checkTimetableUpdates',
    async (_, thunkAPI) => {
        try {
            const token = getToken();
            if (!token) return { hasUpdates: false };

            const response = await axios.get('http://localhost:8000/api/notifications/timetable-updates', {
                headers: { Authorization: `Bearer ${token}` }
            });

            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || error.message || 'Failed to check timetable updates'
            );
        }
    }
);

export const markNotificationAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (notificationId, thunkAPI) => {
        try {
            const token = getToken();
            if (!token) return { id: notificationId, success: false };

            await axios.post(`http://localhost:8000/api/notifications/${notificationId}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            return { id: notificationId, success: true };
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || error.message || 'Failed to mark notification as read'
            );
        }
    }
);

export const markAllNotificationsAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, thunkAPI) => {
        try {
            const token = getToken();
            if (!token) return { success: false };

            await axios.post('http://localhost:8000/api/notifications/mark-all-read', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            return { success: true };
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || error.message || 'Failed to mark all notifications as read'
            );
        }
    }
);

// Initial state
const initialState = {
    items: getCachedNotifications(),
    unreadCount: getCachedNotifications().filter(n => !n.read).length,
    loading: false,
    error: null,
    lastChecked: localStorage.getItem('lastNotificationCheck') || null
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification(state, action) {
            // Check if notification already exists
            const exists = state.items.some(n => n.id === action.payload.id);
            if (!exists) {
                state.items.push(action.payload);
                if (!action.payload.read) {
                    state.unreadCount += 1;
                }

                // Update local storage
                localStorage.setItem(getLocalStorageKey(), JSON.stringify(state.items));
            }
        },
        clearNotificationError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch notifications
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;

                // Process notifications that might have JSON data
                const processedNotifications = action.payload.map(notification => {
                    // Try to parse data if it's a string
                    if (notification.data && typeof notification.data === 'string') {
                        try {
                            const parsedData = JSON.parse(notification.data);
                            return { ...notification, data: parsedData };
                        } catch (e) {
                            console.error('Error parsing notification data:', e);
                            return notification;
                        }
                    }
                    return notification;
                });

                state.items = processedNotifications;
                state.unreadCount = processedNotifications.filter(n => !n.read).length;
                state.lastChecked = new Date().toISOString();

                // Cache notifications
                localStorage.setItem(getLocalStorageKey(), JSON.stringify(processedNotifications));
                localStorage.setItem('lastNotificationCheck', state.lastChecked);
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Timetable update check
            .addCase(checkTimetableUpdates.fulfilled, (state, action) => {
                if (action.payload.hasUpdates && action.payload.id) {
                    // Check if we already have this notification
                    const exists = state.items.some(n => n.id === action.payload.id);
                    if (!exists) {
                        const newNotification = {
                            id: action.payload.id,
                            type: 'timetable-update',
                            message: 'New timetable has been published',
                            read: false,
                            date: action.payload.date || new Date().toISOString()
                        };

                        state.items.unshift(newNotification);
                        state.unreadCount += 1;

                        // Update local storage
                        localStorage.setItem(getLocalStorageKey(), JSON.stringify(state.items));
                    }
                }
            })

            // Mark notification as read
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                if (action.payload.success) {
                    const notif = state.items.find(n => n.id === action.payload.id);
                    if (notif && !notif.read) {
                        notif.read = true;
                        state.unreadCount = Math.max(0, state.unreadCount - 1);

                        // Update local storage
                        localStorage.setItem(getLocalStorageKey(), JSON.stringify(state.items));
                    }
                }
            })

            // Mark all as read
            .addCase(markAllNotificationsAsRead.fulfilled, (state, action) => {
                if (action.payload.success) {
                    state.items.forEach(n => {
                        n.read = true;
                    });
                    state.unreadCount = 0;

                    // Update local storage
                    localStorage.setItem(getLocalStorageKey(), JSON.stringify(state.items));
                }
            });
    }
});

export const { addNotification, clearNotificationError } = notificationSlice.actions;
export default notificationSlice.reducer;