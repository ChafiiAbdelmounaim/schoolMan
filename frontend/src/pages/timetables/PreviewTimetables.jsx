import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = [
    { label: '09:00 - 12:00', start: '09:00:00', end: '12:00:00' },
    { label: '14:00 - 17:00', start: '14:00:00', end: '17:00:00' }
];

const PreviewTimetables = () => {
    const navigate = useNavigate();
    const [timetables, setTimetables] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Load unconfirmed timetables directly from the API
        fetchUnconfirmedTimetables();
    }, []);

    const fetchUnconfirmedTimetables = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get('http://localhost:8000/api/emploi?status=unconfirmed', {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("Unconfirmed timetables:", res.data);

            if (Array.isArray(res.data) && res.data.length > 0) {
                setTimetables(res.data);
                const uniqueSemesterIds = [...new Set(res.data.map(obj => obj.semester_id))];
                setSemesters(uniqueSemesterIds);
            } else {
                // No timetables found or data is not an array
                setError("No timetables found. Generation may have failed.");
            }
        } catch (err) {
            console.error("Error loading unconfirmed timetables:", err);
            setError(`Error loading timetables: ${err.message}`);
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
            navigate('/'); // Or wherever you want to redirect after confirmation
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
            className: "bg-blue-100"
        };
    };

    if (loading) return <div className="p-4 text-center">⏳ Loading timetable...</div>;

    // Show a message if no timetables or semesters exist
    if (timetables.length === 0 || semesters.length === 0) {
        return (
            <div className="max-w-4xl mx-auto mt-16 p-6">
                <h2 className="text-2xl font-bold text-center mb-8">Preview Generated Timetables</h2>
                <div className="p-8 bg-gray-50 rounded-lg text-center">
                    <p className="text-lg text-gray-600">
                        {error || "No timetables available to display."}
                    </p>
                    <button
                        onClick={() => navigate('/timetables')}
                        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    >
                        Return to Generation
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto mt-16 p-6 pb-24">
            <h2 className="text-2xl font-bold text-center mb-8">Preview Generated Timetables</h2>

            {/* Loop through semesters and render a table for each one */}
            {semesters.map((semesterId) => {
                const semesterTimetables = timetables.filter(item => item.semester_id === semesterId);
                if (semesterTimetables.length === 0) return null;

                return (
                    <div key={semesterId} className="mb-8 border rounded-md shadow-sm">
                        <h3 className="text-xl font-semibold mb-4 p-4 bg-gray-50 rounded-t-md">
                            {semesterTimetables[0]?.semester?.year?.filier?.name || 'Unknown Program'} -
                            Year {semesterTimetables[0]?.semester?.year?.year_number || '?'} -
                            Semester {semesterTimetables[0]?.semester?.semName || '?'}
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

            {/* Confirmation buttons */}
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
        </div>
    );
};

export default PreviewTimetables;