import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    checkTimetableUpdates,
    addNotification
} from '../store/notificationSlice';

const useNotifications = () => {
    const dispatch = useDispatch();
    const {
        items: notifications,
        unreadCount,
        loading,
        error
    } = useSelector(state => state.notifications);

    const { role, token } = useSelector(state => state.auth);

    // Load notifications on component mount
    useEffect(() => {
        if (token && role) {
            dispatch(fetchNotifications());

            // Set up polling for timetable updates
            const interval = setInterval(() => {
                dispatch(checkTimetableUpdates());
            }, 5 * 60 * 1000); // Check every 5 minutes

            return () => clearInterval(interval);
        }
    }, [dispatch, token, role]);

    // Mark a notification as read
    const markAsRead = useCallback((notificationId) => {
        dispatch(markNotificationAsRead(notificationId));
    }, [dispatch]);

    // Mark all notifications as read
    const markAllAsRead = useCallback(() => {
        dispatch(markAllNotificationsAsRead());
    }, [dispatch]);

    // Simulate a notification (for testing)
    const simulateTimetableUpdate = useCallback(() => {
        const notification = {
            id: Date.now(),
            type: 'timetable-update',
            message: 'New timetable has been published',
            read: false,
            date: new Date().toISOString()
        };

        dispatch(addNotification(notification));
        return notification;
    }, [dispatch]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        simulateTimetableUpdate
    };
};

export default useNotifications;