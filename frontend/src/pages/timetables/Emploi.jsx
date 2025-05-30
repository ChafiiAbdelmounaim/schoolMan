import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = [
    { label: '09:00 - 12:00', start: '09:00:00', end: '12:00:00' },
    { label: '14:00 - 17:00', start: '14:00:00', end: '17:00:00' }
];

const Emploi = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [timetables, setTimetables] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        console.log("Location state:", location.state);

        // Check if we're coming from generation with state data
        if (location.state?.generatedData) {
            console.log("Generated data received:", location.state.generatedData);

            // Extract data based on API response structure
            const data = location.state.generatedData.data || [];
            console.log("Timetable data:", data);

            setTimetables(data);

            // Set semester IDs only if we have data
            if (data.length > 0) {
                const uniqueSemesterIds = [...new Set(data.map(obj => obj.semester_id))];
                console.log("Semester IDs:", uniqueSemesterIds);
                setSemesters(uniqueSemesterIds);
            }

            setIsPreviewMode(true);
            setLoading(false);
        } else {
            // Normal load of existing timetables
            fetchTimetables();
        }
    }, [location.state]);

    const fetchTimetables = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get('http://localhost:8000/api/emploi', {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("Fetched timetables:", res.data);

            if (Array.isArray(res.data)) {
                setTimetables(res.data);
                const uniqueSemesterIds = [...new Set(res.data.map(obj => obj.semester_id))];
                setSemesters(uniqueSemesterIds);
            }
        } catch (err) {
            console.error("Error loading timetable:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        setIsProcessing(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post('http://localhost:8000/api/confirm-timetables', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Timetables confirmed successfully!');
            navigate('/analytics'); // Or wherever you want to redirect after confirmation
        } catch (error) {
            console.error("Confirmation failed:", error);
            alert("Failed to confirm timetables");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = async () => {
        setIsProcessing(true);
        try {
            const token = localStorage.getItem("token");
            await axios.delete('http://localhost:8000/api/cancel-timetables', {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate('/timetables');
        } catch (error) {
            console.error("Failed to cancel:", error);
            alert("Failed to cancel generation");
        } finally {
            setIsProcessing(false);
        }
    };

    // Function to navigate to edit page for a specific semester
    const handleTimetableClick = (semesterId, semesterInfo) => {
        navigate(`/edit-timetable/${semesterId}`, {
            state: {
                timetableData: timetables.filter(item => item.semester_id === semesterId),
                semesterInfo: semesterInfo
            }
        });
    };

    const getCellContent = (semesterId, day, slot) => {
        const entry = timetables.find(item =>
            item.day === day &&
            item.start_time === slot.start &&
            item.end_time === slot.end &&
            item.semester_id === semesterId
        );

        if (!entry) {
            return {
                content: <span className="text-gray-400 text-sm">-</span>,
                className: "bg-white"
            };
        }

        return {
            content: (
                <div className="text-sm text-gray-800 leading-5">
                    <div><strong>{entry.course?.name || 'N/A'}</strong></div>
                    <div>{entry.teacher?.full_name || 'N/A'} - {entry.classroom?.name || 'N/A'}</div>
                </div>
            ),
            className: isPreviewMode ? "bg-blue-100" : "bg-blue-200"
        };
    };

    if (loading) return <div className="p-4 text-center">⏳ Loading timetable...</div>;

    // Show a message if no timetables or semesters exist
    if (timetables.length === 0 || semesters.length === 0) {
        return (
            <div className="max-w-4xl mx-auto mt-16 p-6">
                <h2 className="text-2xl font-bold text-center mb-8">
                    {isPreviewMode ? 'Preview Generated Timetables' : 'Current Timetables'}
                </h2>
                <div className="p-8 bg-gray-50 rounded-lg text-center">
                    <p className="text-lg text-gray-600">No timetables available to display.</p>
                    {isPreviewMode && (
                        <button
                            onClick={() => navigate('/generate-timetables')}
                            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                        >
                            Return to Generation
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto mt-16 p-6">
            <h2 className="text-2xl font-bold text-center mb-8">
                {isPreviewMode ? 'Preview Generated Timetables' : 'Current Timetables'}
            </h2>

            {/* Loop through semesters and render a table for each one */}
            {semesters.map((semesterId) => {
                const semesterTimetables = timetables.filter(item => item.semester_id === semesterId);
                if (semesterTimetables.length === 0) return null;

                // Get semester info for this timetable
                const semesterInfo = {
                    program: semesterTimetables[0]?.semester?.year?.filier?.name || 'Unknown Program',
                    year: semesterTimetables[0]?.semester?.year?.year_number || '?',
                    semester: semesterTimetables[0]?.semester?.semName || '?',
                };

                // Create title for the timetable
                const timetableTitle = `${semesterInfo.program} - Year ${semesterInfo.year} - Semester ${semesterInfo.semester}`;

                return (
                    <div key={semesterId} className="mb-8 border rounded-md shadow-sm">
                        {/* Make the title clickable */}
                        <h3
                            className="text-xl font-semibold mb-4 p-4 bg-gray-50 rounded-t-md cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                            onClick={() => handleTimetableClick(semesterId, semesterInfo)}
                        >
                            <span>{timetableTitle}</span>
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                            </svg>
                        </h3>

                        <div className="overflow-x-auto p-4">
                            <table className="table-auto w-full border-collapse border border-gray-300 text-center">
                                <thead className="bg-gray-800 text-white">
                                <tr>
                                    <th className="border px-4 py-2">Day</th>
                                    {timeSlots.map((slot, i) => (
                                        <th key={i} className="border px-4 py-2">
                                            {slot.label}
                                        </th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {daysOfWeek.map((day) => (
                                    <tr key={day}>
                                        <td className="border px-4 py-4 font-medium text-white bg-gray-800">{day}</td>
                                        {timeSlots.map((slot, i) => {
                                            const cell = getCellContent(semesterId, day, slot);
                                            return (
                                                <td key={i} className={`border px-4 py-4 align-top ${cell.className}`}>
                                                    {cell.content}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}

            {/* Confirmation buttons (only shown in preview mode) */}
            {isPreviewMode && (
                <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-lg">
                    <div className="max-w-4xl mx-auto flex justify-end space-x-4">
                        <button
                            onClick={handleCancel}
                            disabled={isProcessing}
                            className={`px-6 py-2 ${isProcessing ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'} text-white rounded-md`}
                        >
                            Cancel Generation
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isProcessing}
                            className={`px-6 py-2 ${isProcessing ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white rounded-md`}
                        >
                            {isProcessing ? 'Processing...' : 'Confirm Timetables'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Emploi;