import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth.js";

export default function TeacherClasses() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const fetchTeacherSubjects = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    `http://localhost:8000/api/teachers/${user.id}/subjects`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setClasses(processSubjectsData(response.data.subjects || []));
            } catch (error) {
                console.error("Error fetching teacher subjects:", error);
                setError(error.response?.data?.message || "Failed to load classes data");
                setClasses(sampleClasses); // Fallback to sample data
            } finally {
                setLoading(false);
            }
        };

        fetchTeacherSubjects();
    }, [user.id]);

    // Function to transform API data into the format we need
    const processSubjectsData = (subjects) => {
        const groupedSubjects = {};

        subjects.forEach(subject => {
            const subjectName = subject.name;

            if (!groupedSubjects[subjectName]) {
                groupedSubjects[subjectName] = {
                    id: subject.id,
                    subject: subjectName,
                    classes: []
                };
            }

            groupedSubjects[subjectName].classes.push({
                id: subject.semester.id,
                name: `${subject.semester.year.filier.name} ${subject.semester.year.year_number}`,
                semester: subject.semester.semName,
                schedule: "Check schedule in timetable",
                students: 25
            });
        });

        return Object.values(groupedSubjects);
    };


    // Filter by search and active tab
    const filteredBySearch = classes.map(classGroup => {
        if (classGroup.subject.toLowerCase().includes(searchTerm.toLowerCase())) {
            return classGroup;
        }

        const filteredClasses = classGroup.classes.filter(cls =>
            cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cls.semester.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return filteredClasses.length > 0 ? { ...classGroup, classes: filteredClasses } : null;
    }).filter(Boolean);

    const filteredClasses = activeTab === "all"
        ? filteredBySearch
        : filteredBySearch.filter(item => item.subject.toLowerCase() === activeTab.toLowerCase());

    // Get all unique subjects for tabs
    const subjects = ["all", ...new Set(classes.map(item => item.subject.toLowerCase()))];

    if (loading) return (
        <div className="max-w-6xl mx-auto mt-4 p-4">
            <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto mt-4 p-4">
            {/* Compact Header with Search and Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-4">
                <div className="flex flex-wrap items-center p-3 gap-2">
                    <h2 className="text-xl font-bold mr-auto">My Classes</h2>

                    {/* Search Bar */}
                    <div className="relative flex-grow max-w-md">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-1.5 pl-8 text-sm border rounded"
                        />
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <i className="fas fa-search text-gray-400 text-sm"></i>
                        </div>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                <i className="fas fa-times text-sm"></i>
                            </button>
                        )}
                    </div>
                </div>

                {/* Subject Tabs */}
                <div className="px-3 pb-1 overflow-x-auto">
                    <ul className="flex space-x-1 text-sm">
                        {subjects.map((subject, index) => (
                            <li key={index}>
                                <button
                                    onClick={() => setActiveTab(subject)}
                                    className={`px-3 py-1 rounded-md whitespace-nowrap ${
                                        activeTab === subject
                                            ? "bg-gray-800 text-white"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    {subject === "all" ? "All" : subject.charAt(0).toUpperCase() + subject.slice(1)}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Error message if any */}
            {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Classes Cards - More Compact Layout */}
            {filteredClasses.length > 0 ? (
                <div className="space-y-4">
                    {filteredClasses.map(item => (
                        <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="bg-gray-800 text-white p-2 px-4">
                                <h2 className="text-lg font-bold">{item.subject}</h2>
                            </div>
                            <div className="p-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {item.classes.map(classItem => (
                                        <div
                                            key={classItem.id}
                                            className="bg-gray-50 border rounded p-3 hover:bg-gray-100 cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-gray-800">{classItem.name}</h3>
                                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                                    {classItem.semester}
                                                </span>
                                            </div>
                                            <div className="mt-2 text-sm text-gray-700">
                                                <div className="flex justify-between">
                                                    <span className="flex items-center">
                                                        <i className="fas fa-user-graduate mr-1 text-gray-500"></i>
                                                        {classItem.students} Students
                                                    </span>

                                                </div>
                                                <p className="flex items-center mt-1">
                                                    <i className="fas fa-clock mr-1 text-gray-500"></i>
                                                    {classItem.schedule}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <div className="py-6">
                        <i className="fas fa-search text-gray-300 text-3xl mb-2"></i>
                        <h3 className="text-lg font-medium text-gray-700">No Classes Found</h3>
                        <p className="text-gray-500 text-sm mt-1">
                            {searchTerm
                                ? `No results matching "${searchTerm}"`
                                : "You don't have any classes assigned yet"}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="mt-3 bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 text-sm rounded"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}