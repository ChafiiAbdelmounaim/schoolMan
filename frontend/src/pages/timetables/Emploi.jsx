import React, { useEffect, useState } from 'react';
import axios from 'axios';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = [
    { label: '09:00 - 12:00', start: '09:00:00', end: '12:00:00' },
    { label: '14:00 - 17:00', start: '14:00:00', end: '17:00:00' }
];

const Emploi = () => {
    const [timetables, setTimetables] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/emploi')
            .then(res => {
                if (Array.isArray(res.data)) {
                    setTimetables(res.data);
                    const uniqueSemesterIds = [...new Set(res.data.map(obj => obj.semester_id))];
                    setSemesters(uniqueSemesterIds);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading timetable:", err);
                setLoading(false);
            });
    }, []);

    const getCellContent = (semesterId, day, slot) => {
        const entry = timetables.find(item =>
            item.day === day &&
            item.start_time === slot.start &&
            item.end_time === slot.end &&
            item.semester_id === semesterId
        );

        if (!entry) return <span className="text-gray-400 text-sm">-</span>;

        return (
            <div className="text-sm text-gray-800 leading-5">
                <div><strong>{entry.course?.name || 'N/A'}</strong></div>
                <div>{entry.teacher?.full_name || 'N/A'} - {entry.classroom?.name || 'N/A'}</div>
            </div>
        );
    };

    if (loading) return <div className="p-4 text-center">⏳ Loading timetable...</div>;

    return (
        <div className="max-w-4xl mx-auto mt-16 p-6 border rounded-md shadow-md">
            <h2 className="text-2xl font-bold text-center mb-8">Timetables</h2>

            {/* Loop through semesters and render a table for each one */}
            {semesters.map((semesterId) => {
                // Filter timetables for the current semester
                const semesterTimetables = timetables.filter(item => item.semester_id === semesterId);

                return (
                    <div key={semesterId} className="mb-8">
                        <h3 className="text-xl font-semibold mb-4">
                            {semesterTimetables[0].semester.year.filier.name} {semesterTimetables[0].semester.year.year_number} - {semesterTimetables[0].semester.semName}
                        </h3>

                        {/* Timetable Table */}
                        <div className="overflow-x-auto">
                            <table className="table-auto w-full border-collapse border border-gray-300 text-center">
                                <thead className="bg-indigo-200">
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
                                        <td className="border px-4 py-4 font-medium bg-indigo-200">{day}</td>
                                        {timeSlots.map((slot, i) => (
                                            <td key={i} className="border px-4 py-4 align-top text-sm">
                                                {getCellContent(semesterId, day, slot)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Emploi;
