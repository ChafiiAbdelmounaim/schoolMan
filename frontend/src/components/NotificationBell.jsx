import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useNotifications from '../hooks/useNotifications';
import useAuth from '../hooks/useAuth';

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const { role } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const notificationRef = useRef(null);
    const navigate = useNavigate();

    // Close notification panel when clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleNotifications = () => {
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);

        // Navigate based on notification type and user role
        if (notification.type === 'timetable-update') {
            if (role === 'teacher') {
                navigate('/teacher/timetable');
            } else if (role === 'student') {
                navigate('/student/timetable');
            } else if (role === 'user') {
                navigate('/emploi'); // Assuming admin users view timetables here
            }
        } else if (notification.type === 'announcement') {
            // Navigate to announcement detail page based on role
            if (role === 'teacher') {
                navigate(`/teacher/announcements/${notification.id}`);
            } else if (role === 'student') {
                navigate(`/student/announcements/${notification.id}`);
            } else if (role === 'user') {
                navigate(`/announcements/${notification.id}`);
            }
        }

        setIsOpen(false);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Extract data from notification
    const getNotificationData = (notification) => {
        if (!notification.data) return {};

        try {
            return typeof notification.data === 'string'
                ? JSON.parse(notification.data)
                : notification.data;
        } catch (e) {
            console.error('Error parsing notification data:', e);
            return {};
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        // Skip read markers
        if (notification.type === 'read-marker') {
            return false;
        }

        // The rest of your existing filtering logic
        if (notification.type === 'announcement') {
            if (notification.user_type && notification.user_type !== role) {
                return false;
            }
        }
        return true;
    });

    return (
        <div className="relative" ref={notificationRef}>
            <button
                className="p-2 text-xl hover:text-gray-300 transition-colors relative"
                onClick={toggleNotifications}
                aria-label="Notifications"
            >
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-12 right-0 w-80 bg-white text-black shadow-xl rounded-lg overflow-hidden z-50 border border-gray-200">
                    <div className="flex justify-between items-center bg-gray-100 p-3 border-b border-gray-200">
                        <h3 className="font-bold text-gray-700">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {filteredNotifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No notifications
                            </div>
                        ) : (
                            filteredNotifications.map((notification) => {
                                const notificationData = getNotificationData(notification);

                                return (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {notification.type === 'timetable-update' && (
                                                <div className="text-blue-500 text-xl mt-1">
                                                    <i className="fas fa-calendar-alt"></i>
                                                </div>
                                            )}
                                            {notification.type === 'announcement' && (
                                                <div className="text-red-500 text-xl mt-1">
                                                    <i className="fas fa-bullhorn"></i>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <p className={`${!notification.read ? 'font-semibold' : 'font-medium'} text-gray-800`}>
                                                        {notification.message}

                                                        {/* For announcements, add the sender name */}
                                                        {notification.type === 'announcement' && notificationData.sender_name && (
                                                            <span className="block text-xs text-gray-600 mt-1">
                                From: {notificationData.sender_name}
                              </span>
                                                        )}
                                                    </p>
                                                    {!notification.read && (
                                                        <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatDate(notification.date || notification.created_at || notificationData.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;