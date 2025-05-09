import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';

const Announcement = () => {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [formData, setFormData] = useState({
        title: '',
        body: '',
        recipients: [] // 'student', 'teacher', or both
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [formVisible, setFormVisible] = useState(true);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;

        setFormData(prev => {
            if (checked) {
                return { ...prev, recipients: [...prev.recipients, value] };
            } else {
                return { ...prev, recipients: prev.recipients.filter(r => r !== value) };
            }
        });
    };

    const validateForm = () => {
        let isValid = true;
        setMessage("");

        if (!formData.title.trim()) {
            setMessage("Title is required");
            isValid = false;
        } else if (!formData.body.trim()) {
            setMessage("Announcement body is required");
            isValid = false;
        } else if (formData.recipients.length === 0) {
            setMessage("Please select at least one recipient group");
            isValid = false;
        }

        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setMessage("");

        try {
            const response = await axios.post(
                'http://localhost:8000/api/announcements',
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage("Announcement sent successfully!");

            // Reset form
            setFormData({
                title: '',
                body: '',
                recipients: []
            });

            // Automatically navigate back after a delay
            setTimeout(() => {
                navigate('/announcements');
            }, 3000);

        } catch (err) {
            setMessage(err.response?.data?.message || "Failed to send announcement");
            console.error("Error sending announcement:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            body: '',
            recipients: []
        });
        setMessage("");
        setFormVisible(false);
    };

    return (
        <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Send Announcement</h1>

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFormVisible(!formVisible)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition flex items-center gap-2"
                    >
                        {formVisible ? (
                            <>
                                <i className="fas fa-times"></i> Hide Form
                            </>
                        ) : (
                            <>
                                <i className="fas fa-plus"></i> Create Announcement
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Status Messages */}
            {message && (
                <div className={`mb-6 p-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="flex items-center gap-2">
                        {message.includes('success') ? (
                            <i className="fas fa-check-circle"></i>
                        ) : (
                            <i className="fas fa-exclamation-circle"></i>
                        )}
                        <span>{message}</span>
                    </div>
                </div>
            )}

            {/* Announcement Form */}
            {formVisible && (
                <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg shadow-inner">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">
                        New Announcement
                    </h2>

                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                                Title
                            </label>
                            <input
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                id="title"
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Announcement Title"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="body">
                                Announcement Content
                            </label>
                            <textarea
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                id="body"
                                name="body"
                                value={formData.body}
                                onChange={handleInputChange}
                                placeholder="Write your announcement here..."
                                rows="6"
                                disabled={isSubmitting}
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Recipients
                            </label>
                            <div className="flex flex-wrap gap-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 text-blue-600 border border-gray-300 rounded"
                                        value="student"
                                        checked={formData.recipients.includes('student')}
                                        onChange={handleCheckboxChange}
                                        disabled={isSubmitting}
                                    />
                                    <span className="ml-2 text-gray-700">Students</span>
                                </label>

                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 text-blue-600 border border-gray-300 rounded"
                                        value="teacher"
                                        checked={formData.recipients.includes('teacher')}
                                        onChange={handleCheckboxChange}
                                        disabled={isSubmitting}
                                    />
                                    <span className="ml-2 text-gray-700">Teachers</span>
                                </label>

                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-4 py-2 rounded-md text-white transition ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-2"></i>
                                    Processing...
                                </>
                            ) : (
                                "Send Announcement"
                            )}
                        </button>
                    </div>
                </form>
            )}

        </div>
    );
};

export default Announcement;