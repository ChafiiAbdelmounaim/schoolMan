import React, { useEffect, useState } from "react";
import axios from "axios";
import {useNavigate} from "react-router";
import useAuth from "../../hooks/useAuth.js";

export default function StudentDashboard() {
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`http://localhost:8000/api/students/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStudent(response.data.student);
                console.log(response.data.student);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching student:", error);
                setMessage("Error fetching student data");
                setLoading(false);
            }
        };

        fetchStudent();
    }, []);

    if (loading) return <div className="p-6 text-gray-700">Loading student info...</div>;
    if (!student) return <div className="p-6 text-red-600">{message}</div>;

    return (
        <div className="max-w-6xl mx-auto mt-8 p-6">
            {/* Welcome Message */}
            <div className="bg-gray-800 text-white rounded-lg p-6 mb-6 shadow-md">
                <h2 className="text-2xl font-bold">
                    Welcome back, {student.full_name || "Student"}!
                </h2>
                <p className="mt-2 text-gray-200">Every small step counts. Keep moving forward!</p>
            </div>

            {/* Personal Info and Program Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-200 rounded-lg p-4 shadow-md">
                    <h3 className="font-semibold text-lg text-gray-800">Full Name</h3>
                    <p className="text-gray-700">{student.full_name}</p>
                    <h3 className="font-semibold text-lg mt-2 text-gray-800">Email</h3>
                    <p className="text-gray-700">{student.email}</p>
                    <h3 className="font-semibold text-lg mt-2 text-gray-800">Birth Date</h3>
                    <p className="text-gray-700">
                        {student.dateNaisance ? new Date(student.dateNaisance).toLocaleDateString() : '-'}
                    </p>
                </div>
                <div className="bg-gray-200 rounded-lg p-4 shadow-md col-span-2">
                    <h3 className="font-semibold text-lg text-gray-800">Program</h3>
                    <p className="text-2xl font-bold text-gray-800">{student.year.filier.name} {student.year.year_number}</p>
                    <p className="mt-2 text-sm text-gray-600">12 assignments submitted, 3 pending</p>
                    <p className="text-sm text-gray-600">Current attendance rate: 89%</p>
                </div>
            </div>

            {/* Support Contacts & Timetable Button */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-200 p-4 rounded-lg shadow-md">
                    <h3 className="font-semibold text-lg mb-2 text-gray-800">Student Support Contacts</h3>
                    <ul className="space-y-2">
                        <li>
                            <strong className="text-gray-800">Academic Advisor</strong>
                            <p className="text-sm text-gray-600">advising@school.edu</p>
                        </li>
                        <li>
                            <strong className="text-gray-800">Tech Help Desk</strong>
                            <p className="text-sm text-gray-600">support@school.edu</p>
                        </li>
                    </ul>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between">
                    <div>
                        <h3 className="font-semibold text-lg mb-2 text-gray-800">See Timetable</h3>
                        <p className="text-sm text-gray-700 mb-4">Check your current class schedule and plan your day ahead.</p>
                    </div>
                    <button className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md self-start transition"
                            onClick={() => navigate("/student/timetable")}>
                        View Timetable
                    </button>
                </div>
            </div>
        </div>
    );
}