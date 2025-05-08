import  { useEffect, useState } from 'react';
import axios from 'axios';
import useAuth from "../../hooks/useAuth.js";


const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = [
    { label: '09:00 - 12:00', start: '09:00:00', end: '12:00:00' },
    { label: '14:00 - 17:00', start: '14:00:00', end: '17:00:00' }
];

const TeacherEmploi = () => {
    const { user } = useAuth();
    const [timetables, setTimetables] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            axios.get(`http://127.0.0.1:8000/api/teacher/${user.id}/timetable`)
                .then(res => {
                    setTimetables(Array.isArray(res.data) ? res.data : []);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error loading teacher timetable:", err);
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
                    <div>{entry.classroom?.name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">
                        {entry.semester?.year.filier.name || 'N/A'} - {entry.semester?.semName || 'N/A'}
                    </div>
                </div>
            ),
            className: "bg-blue-100"
        };
    };

    if (loading) return <div className="p-4 text-center">⏳ Loading your timetable...</div>;

    return (
        <div className="max-w-4xl mx-auto mt-8 p-6 border rounded-md shadow-md">
            <h2 className="text-2xl font-bold text-center mb-6">Your Teaching Timetable</h2>
            <p className="text-center text-gray-600 mb-6">
                {user?.full_name} | {user?.email}
            </p>

            <div className="overflow-x-auto">
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
                                const cell = getCellContent(day, slot);
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
};

export default TeacherEmploi;