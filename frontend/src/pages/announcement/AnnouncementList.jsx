import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';

const AnnouncementList = () => {
    const navigate = useNavigate();
    const { token, role } = useAuth();

    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Safely get data field from announcement
    const getDataField = (announcement, fieldName, defaultValue = '') => {
        if (!announcement) return defaultValue;

        // If data exists and is an object
        if (announcement.data && typeof announcement.data === 'object') {
            return announcement.data[fieldName] || defaultValue;
        }

        // If we have direct fields (from backend API)
        if (announcement[fieldName] !== undefined) {
            return announcement[fieldName];
        }

        return defaultValue;
    };

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const response = await axios.get(
                    'http://localhost:8000/api/announcements',
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Make sure to handle the data properly
                const announcementsData = Array.isArray(response.data) ? response.data : [];

                // Process each announcement to ensure data is properly parsed
                const processedAnnouncements = announcementsData.map(announcement => {
                    // If data is a string, try to parse it
                    if (announcement.data && typeof announcement.data === 'string') {
                        try {
                            announcement.data = JSON.parse(announcement.data);
                        } catch (e) {
                            console.error('Failed to parse announcement data JSON', e);
                            // Keep the original data
                            announcement.data = {};
                        }
                    } else if (!announcement.data) {
                        announcement.data = {};
                    }
                    return announcement;
                });

                setAnnouncements(processedAnnouncements);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load announcements");
                console.error("Error fetching announcements:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, [token]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get recipient label from array
    const getRecipientLabel = (recipients) => {
        if (!recipients || recipients.length === 0) return 'None';

        if (recipients.length === 3) return 'All Users';

        const mapping = {
            'student': 'Students',
            'teacher': 'Teachers',
            'user': 'Admins'
        };

        return recipients.map(r => mapping[r] || r).join(', ');
    };

    // Truncate text
    const truncateText = (text, maxLength = 100) => {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Filter announcements based on search query
    const filteredAnnouncements = announcements.filter(announcement => {
        const title = announcement.title || announcement.message || '';
        const body = getDataField(announcement, 'body', '');
        const sender = getDataField(announcement, 'sender_name', 'Admin');

        const searchLower = searchQuery.toLowerCase();
        return (
            title.toLowerCase().includes(searchLower) ||
            body.toLowerCase().includes(searchLower) ||
            sender.toLowerCase().includes(searchLower)
        );
    });

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md text-center">
                <p className="text-gray-700">Loading announcements...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Announcements</h1>

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                {/* Create Button (Admin only) */}
                {role === 'user' && (
                    <button
                        onClick={() => navigate('/announcements/create')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition flex items-center gap-2"
                    >
                        <i className="fas fa-plus"></i> Create Announcement
                    </button>
                )}

                {/* Search Bar */}
                <div className="relative w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search announcements..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                </div>
            </div>

            {/* Status Messages */}
            {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-800 rounded">
                    <div className="flex items-center gap-2">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Announcements Table */}
            {filteredAnnouncements.length === 0 ? (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <p className="text-gray-500">
                        {announcements.length === 0
                            ? "No announcements found."
                            : "No announcements match your search."}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Sender
                            </th>
                            {role === 'user' && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Recipients
                                </th>
                            )}
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAnnouncements.map((announcement) => (
                            <tr key={announcement.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-gray-900">
                                        {announcement.title || announcement.message}
                                    </div>
                                    {getDataField(announcement, 'body') && (
                                        <div className="text-sm text-gray-500">
                                            {truncateText(getDataField(announcement, 'body'))}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {getDataField(announcement, 'sender_name', 'Admin')}
                                    </div>
                                </td>
                                {role === 'user' && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {getRecipientLabel(announcement.recipients)}
                                        </div>
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {formatDate(announcement.created_at)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-2">
                                        <Link
                                            to={role !== 'user' ? `/${role}/announcements/${announcement.id}` : `/announcements/${announcement.id}`}
                                            className="text-blue-600 hover:text-blue-900"
                                            title="View"
                                        >
                                            <i className="fas fa-eye"></i>
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AnnouncementList;