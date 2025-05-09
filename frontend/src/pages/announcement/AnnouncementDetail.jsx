import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';

const AnnouncementDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, role } = useAuth();

    const [announcement, setAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/announcements/${id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Make sure to properly handle the data
                const announcementData = response.data;

                // If data is a string, try to parse it
                if (announcementData.data && typeof announcementData.data === 'string') {
                    try {
                        announcementData.data = JSON.parse(announcementData.data);
                    } catch (e) {
                        console.error('Failed to parse announcement data JSON', e);
                        // Keep the original data as is
                    }
                }

                setAnnouncement(announcementData);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load announcement");
                console.error("Error fetching announcement:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncement();
    }, [id, token]);

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Safely extract data field
    const getDataField = (fieldName, defaultValue = '') => {
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

    // Delete announcement (admin only)
    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) {
            return;
        }

        try {
            await axios.delete(
                `http://localhost:8000/api/announcements/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('Announcement deleted successfully');
            navigate(role !== 'user' ? `/${role}/announcements` : '/announcements');
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete announcement");
            console.error("Error deleting announcement:", err);
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md text-center">
                <p className="text-gray-700">Loading announcement...</p>
            </div>
        );
    }

    if (error || !announcement) {
        return (
            <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
                <div className="mb-6 p-4 bg-red-100 text-red-800 rounded">
                    <div className="flex items-center gap-2">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{error || "Announcement not found"}</span>
                    </div>
                </div>
                <button
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
                    onClick={() => navigate(-1)}
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Announcement Details</h1>

                <div className="flex gap-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded transition flex items-center gap-2"
                    >
                        <i className="fas fa-arrow-left"></i> Back
                    </button>

                    {role === 'user' && (
                        <button
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition flex items-center gap-2"
                        >
                            <i className="fas fa-trash"></i> Delete
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                <div className="border-b pb-4 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {announcement.title || "Untitled Announcement"}
                    </h2>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <i className="fas fa-user text-gray-500"></i>
                            <span>From: {getDataField('sender_name', 'Admin')}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <i className="fas fa-calendar-alt text-gray-500"></i>
                            <span>{formatDateTime(announcement.created_at)}</span>
                        </div>

                        {role === 'user' && announcement.recipients && (
                            <div className="flex items-center gap-1">
                                <i className="fas fa-users text-gray-500"></i>
                                <span>To: {
                                    announcement.recipients.map(r => {
                                        switch(r) {
                                            case 'student': return 'Students';
                                            case 'teacher': return 'Teachers';
                                            case 'user': return 'Admins';
                                            default: return r;
                                        }
                                    }).join(', ')
                                }</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="prose max-w-none">
                    {getDataField('body', 'No content available').split('\n').map((paragraph, index) => (
                        paragraph.trim() ? (
                            <p key={index} className="mb-4 text-gray-800">{paragraph}</p>
                        ) : (
                            <br key={index} />
                        )
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AnnouncementDetail;