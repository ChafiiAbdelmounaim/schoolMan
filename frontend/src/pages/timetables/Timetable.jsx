import { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Timetable = () => {
    const navigate = useNavigate();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [generationType, setGenerationType] = useState(null);

    const confirmGeneration = async (type) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This will clear all existing timetables. Are you sure you want to continue?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            handleGenerateTimetables(type);
        }
    };

    const handleGenerateTimetables = async (type) => {
        setIsGenerating(true);
        setGenerationType(type);

        try {
            const token = localStorage.getItem("token");
            const endpoint = type === 'firstHalf'
                ? "/api/generate-s1-timetables"
                : "/api/generate-s2-timetables";

            const response = await axios.post(
                `http://localhost:8000${endpoint}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("Generation response:", response.data);

            if (response.data.success) {
                await Swal.fire({
                    title: 'Success!',
                    text: 'Timetables generated successfully!',
                    icon: 'success',
                    confirmButtonColor: '#10b981'
                });
                navigate('/preview-timetables');
            } else {
                // Show conflicts if there are any
                if (response.data.conflicts && response.data.conflicts.length > 0) {
                    await Swal.fire({
                        title: 'Generation Completed',
                        text: `Generation completed with conflicts: ${response.data.conflicts.join(', ')}`,
                        icon: 'warning',
                        confirmButtonColor: '#f59e0b'
                    });
                }
                navigate('/preview-timetables');
            }
        } catch (error) {
            console.error("Error generating timetables:", error);
            await Swal.fire({
                title: 'Generation Failed',
                text: error.response?.data?.message || "Generation failed",
                icon: 'error',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDeleteAllTimetables = async () => {
        const result = await Swal.fire({
            title: 'Delete All Timetables?',
            text: "Are you sure you want to delete all timetables? This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete them!',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        });

        if (!result.isConfirmed) {
            return;
        }

        setIsDeleting(true);
        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                "http://localhost:8000/api/cancel-timetables",
                { headers: { Authorization: `Bearer ${token}` } }
            );

            await Swal.fire({
                title: 'Deleted!',
                text: 'All timetables have been successfully deleted.',
                icon: 'success',
                confirmButtonColor: '#10b981'
            });
        } catch (error) {
            console.error("Error deleting timetables:", error);
            await Swal.fire({
                title: 'Delete Failed',
                text: error.response?.data?.message || "Failed to delete timetables",
                icon: 'error',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 transition-all duration-300">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">Timetable Generation</h1>

                <div className="space-y-5">
                    {/* First Half Button */}
                    <button
                        onClick={() => confirmGeneration('firstHalf')}
                        disabled={isGenerating}
                        className={`w-full py-4 px-6 rounded-lg font-medium text-white transition-all duration-300
                            flex items-center justify-center relative overflow-hidden
                            ${isGenerating && generationType === 'firstHalf'
                            ? 'bg-blue-400 cursor-wait'
                            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'}`}
                    >
                        {isGenerating && generationType === 'firstHalf' ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating First Half...
                            </>
                        ) : (
                            <>
                                <span className="mr-2">Generate First Half (S1, S3)</span>
                            </>
                        )}
                    </button>

                    {/* Second Half Button */}
                    <button
                        onClick={() => confirmGeneration('secondHalf')}
                        disabled={isGenerating}
                        className={`w-full py-4 px-6 rounded-lg font-medium text-white transition-all duration-300
                            flex items-center justify-center
                            ${isGenerating && generationType === 'secondHalf'
                            ? 'bg-green-400 cursor-wait'
                            : 'bg-green-600 hover:bg-green-700 hover:shadow-md'}`}
                    >
                        {isGenerating && generationType === 'secondHalf' ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating Second Half...
                            </>
                        ) : (
                            <>
                                <span className="mr-2">Generate Second Half (S2, S4)</span>
                            </>
                        )}
                    </button>

                    {/* Delete Button */}
                    <button
                        onClick={handleDeleteAllTimetables}
                        disabled={isDeleting || isGenerating}
                        className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300
                            flex items-center justify-center mt-8
                            ${isDeleting
                            ? 'bg-gray-300 text-gray-500 cursor-wait'
                            : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}
                    >
                        {isDeleting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete All Timetables
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-amber-800 text-sm">
                            <span className="font-medium">Important:</span> Generating new timetables will clear all existing ones. Make sure to confirm your timetables before generating new ones.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timetable;