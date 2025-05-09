import axios from 'axios';

// Simple notification service to handle notifications
class NotificationService {
    constructor() {
        this.baseURL = 'http://localhost:8000/api';
        this.listeners = [];
        this.readMarkers = this._loadReadMarkers();
    }

    // Add a listener for notifications
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(listener => listener !== callback);
        };
    }

    // Notify all listeners
    notify(notification) {
        this.listeners.forEach(listener => listener(notification));
    }

    // Get notifications for the current user
    async getNotifications(token) {
        try {
            const response = await axios.get(`${this.baseURL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Process notifications for read status (for broadcast notifications)
            const notifications = this._processNotificationsReadStatus(response.data);
            return notifications;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }

    // Mark a notification as read
    async markAsRead(notificationId, token) {
        try {
            await axios.post(`${this.baseURL}/notifications/${notificationId}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Also update local read markers for offline access
            this._markLocallyAsRead(notificationId);

            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error);

            // Fallback: update local read markers
            this._markLocallyAsRead(notificationId);

            return false;
        }
    }

    // Check for new timetable notifications
    async checkForTimetableUpdates(token) {
        try {
            const response = await axios.get(`${this.baseURL}/notifications/timetable-updates`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.hasUpdates) {
                this.notify({
                    id: response.data.id || Date.now(),
                    type: 'timetable-update',
                    message: 'New timetable has been published',
                    read: false,
                    date: response.data.date || new Date().toISOString()
                });
            }

            return response.data;
        } catch (error) {
            console.error('Error checking for timetable updates:', error);
            return { hasUpdates: false };
        }
    }

    // For local testing without backend
    simulateTimetableUpdate() {
        const notification = {
            id: Date.now(),
            type: 'timetable-update',
            message: 'New timetable has been published',
            read: false,
            date: new Date().toISOString(),
            broadcast: true,
            user_type: localStorage.getItem('userType') || 'student' // Default to student
        };

        this.notify(notification);

        // Store in localStorage as a fallback mechanism
        const existingNotifications = this.getLocalNotifications();
        localStorage.setItem('notifications', JSON.stringify([...existingNotifications, notification]));

        return notification;
    }

    // Get notifications from localStorage (fallback)
    getLocalNotifications() {
        return this._processNotificationsReadStatus(
            JSON.parse(localStorage.getItem('notifications') || '[]')
        );
    }

    // Mark local notification as read
    _markLocallyAsRead(notificationId) {
        // Update in-memory read markers
        this.readMarkers[notificationId] = true;

        // Update localStorage
        localStorage.setItem('notificationReadMarkers', JSON.stringify(this.readMarkers));

        // Also update notification in localStorage if it exists
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const updatedNotifications = notifications.map(notification =>
            notification.id === notificationId ? { ...notification, read: true } : notification
        );
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    }

    // Load read markers from localStorage
    _loadReadMarkers() {
        return JSON.parse(localStorage.getItem('notificationReadMarkers') || '{}');
    }

    // Process notifications to check read status against local read markers
    _processNotificationsReadStatus(notifications) {
        return notifications.map(notification => {
            // If broadcast notification and we have a local read marker, mark as read
            if (notification.broadcast && this.readMarkers[notification.id]) {
                return { ...notification, read: true };
            }
            return notification;
        });
    }

    // Mark all as read
    markAllAsRead(token) {
        return axios.post(`${this.baseURL}/notifications/mark-all-read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .catch(error => {
                console.error('Error marking all as read:', error);
                // Fallback local implementation
                const notifications = this.getLocalNotifications();
                notifications.forEach(notification => {
                    this._markLocallyAsRead(notification.id);
                });
            });
    }
}

// Singleton instance
const notificationService = new NotificationService();
export default notificationService;