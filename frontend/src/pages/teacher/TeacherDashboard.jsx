import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth.js";

export default function TeacherDashboard() {
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const fetchTeacher = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`http://localhost:8000/api/teachers/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTeacher(response.data.teacher);
                console.log(response.data.teacher)
                setLoading(false);
            } catch (error) {
                console.error("Error fetching teacher:", error);
                setMessage("Error fetching teacher data");
                setLoading(false);
            }
        };

        fetchTeacher();
    }, [user.id]);

    if (loading) return <div className="p-6 text-gray-700">Loading teacher info...</div>;
    if (!teacher) return <div className="p-6 text-red-600">{message}</div>;

    return (
        <div className="max-w-6xl mx-auto mt-8 p-6">
            {/* Welcome Message */}
            <div className="bg-gray-800 text-white rounded-lg p-6 mb-6 shadow-md">
                <h2 className="text-2xl font-bold">
                    Welcome back, {teacher.full_name || "Teacher"}!
                </h2>
                <p className="mt-2 text-gray-200">Inspire minds and lead with purpose.</p>
            </div>

            {/* Personal Info and Subjects Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-200 rounded-lg p-4 shadow-md">
                    <h3 className="font-semibold text-lg text-gray-800">Full Name</h3>
                    <p className="text-gray-700">{teacher.full_name}</p>
                    <h3 className="font-semibold text-lg mt-2 text-gray-800">Email</h3>
                    <p className="text-gray-700">{teacher.email}</p>
                    <h3 className="font-semibold text-lg mt-2 text-gray-800">Grade</h3>
                    <p className="text-gray-700">{teacher.grade || "Computer Science"}</p>
                </div>
                <div className="bg-gray-200 rounded-lg p-4 shadow-md col-span-2">
                    <h3 className="font-semibold text-lg text-gray-800">Subjects Taught</h3>
                    <ul className="mt-2 space-y-1">
                        {teacher.subjects && teacher.subjects.length > 0 ? (
                            teacher.subjects.map((subject, idx) => (
                                <li key={idx} className="text-gray-700">{subject}</li>
                            ))
                        ) : (
                            <li className="text-gray-700">No subjects assigned.</li>
                        )}
                    </ul>
                    <p className="mt-4 text-sm text-gray-600">Current semester: 8 classes, 3 different courses</p>
                    <p className="text-sm text-gray-600">Next assessment deadline: May 15, 2025</p>
                </div>
            </div>

            {/* Support Contacts & Timetable Button */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-200 p-4 rounded-lg shadow-md">
                    <h3 className="font-semibold text-lg mb-2 text-gray-800">Faculty Support Contacts</h3>
                    <ul className="space-y-2">
                        <li>
                            <strong className="text-gray-800">Department Head</strong>
                            <p className="text-sm text-gray-600">head@school.edu</p>
                        </li>
                        <li>
                            <strong className="text-gray-800">IT Help Desk</strong>
                            <p className="text-sm text-gray-600">it-support@school.edu</p>
                        </li>
                    </ul>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between">
                    <div>
                        <h3 className="font-semibold text-lg mb-2 text-gray-800">See Timetable</h3>
                        <p className="text-sm text-gray-700 mb-4">View your class schedule and teaching hours.</p>
                    </div>
                    <button
                        className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md self-start transition"
                        onClick={() => navigate("/teacher/timetable")}
                    >
                        View Timetable
                    </button>
                </div>
            </div>
        </div>
    );
}