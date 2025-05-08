import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = [
    { label: '09:00 - 12:00', start: '09:00:00', end: '12:00:00' },
    { label: '14:00 - 17:00', start: '14:00:00', end: '17:00:00' }
];

const StudentEmploi = () => {
    const { user } = useAuth();
    const [timetables, setTimetables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [yearName, setYearName] = useState('');

    useEffect(() => {
        if (user?.id) {
            setLoading(true);
            axios.get(`http://127.0.0.1:8000/api/students/${user.id}/timetable`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
                .then(res => {
                    if (Array.isArray(res.data)) {
                        setTimetables(res.data);

                        // // Extract year name if available in the first timetable entry
                        // if (res.data.length > 0 && res.data[0].semester?.year) {
                        //     const year = res.data[0].semester.year;
                        //     setYearName(`${year.filier?.name || ''} ${year.year_number || ''}`);
                        // }
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error loading student timetable:", err);
                    setError("Failed to load timetable. Please try again later.");
                    setLoading(false);
                });
        }
    }, [user]);

    const getCellContent = (day, slot) => {
        const entry = timetables.find(item =>
            item.day === day &&
            item.start_time === slot.start &&
            item.end_time === slot.end
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
                    <div>{entry.teacher?.name || entry.teacher?.full_name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{entry.classroom?.name || 'N/A'}</div>
                </div>
            ),
            className: "bg-blue-100"
        };
    };

    if (loading) {
        return <div className="p-4 text-center">⏳ Loading your timetable...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">{error}</div>;
    }

    if (timetables.length === 0) {
        return <div className="p-4 text-center text-gray-500">No classes scheduled for your year.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto mt-8 p-6 border rounded-md shadow-md">
            <h2 className="text-2xl font-bold text-center mb-2">Your Class Timetable</h2>
            {yearName && <p className="text-center text-lg font-medium mb-4">{yearName}</p>}
            <p className="text-center text-gray-600 mb-6">
                {user?.full_name} | {user?.email}
            </p>

            {/* Single Timetable Table */}
            <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse border border-gray-300 text-center">
                    <thead className="bg-gray-800 text-white">
                    <tr>
                        <th className="border px-4 py-2"></th>
                        {timeSlots.map((slot, i) => (
                            <th key={i} className="border px-4 py-2 text-center">
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
                                const cell = getCellContent(day, slot);
                                return (
                                    <td key={i} className={`border px-4 py-4 align-top text-sm ${cell.className}`}>
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
};

export default StudentEmploi;