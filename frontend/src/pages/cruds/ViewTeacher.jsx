import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ViewTeacher = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem("token");

                // Fetch teacher with subjects
                const teacherResponse = await axios.get(
                    `http://localhost:8000/api/teachers/${id}/subjects`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Fetch all available subjects
                const subjectsResponse = await axios.get(
                    "http://localhost:8000/api/subjects",
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                console.log(subjectsResponse.data)
                console.log('.subjects flkher')
                console.log(subjectsResponse.data.subjects)

                setTeacher(teacherResponse.data.teacher);
                setSubjects(teacherResponse.data.subjects || []);
                setAllSubjects(subjectsResponse.data || []);
                setError("");
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleAttachSubject = async () => {
        if (!selectedSubject) {
            setError("Please select a subject");
            return;
        }

        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            await axios.post(
                `http://localhost:8000/api/teachers/${id}/attach-subject`,
                { subject_id: selectedSubject },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Refresh the data
            const response = await axios.get(
                `http://localhost:8000/api/teachers/${id}/subjects`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSubjects(response.data.subjects || []);
            setSelectedSubject("");
            setError("");
            setSuccessMessage("Subject added successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to attach subject");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDetachSubject = async (subjectId) => {
        if (window.confirm("Are you sure you want to remove this subject?")) {
            try {
                setIsLoading(true);
                const token = localStorage.getItem("token");
                await axios.delete(
                    `http://localhost:8000/api/teachers/${id}/detach-subject/${subjectId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Refresh the subjects list
                const response = await axios.get(
                    `http://localhost:8000/api/teachers/${id}/subjects`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setSubjects(response.data.subjects || []);
                setError("");
                setSuccessMessage("Subject removed successfully!");
                setTimeout(() => setSuccessMessage(""), 3000);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to detach subject");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="max-w-4xl mx-auto mt-8 p-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-red-500">
                {error}
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center justify-center mx-auto"
                >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Back to List
                </button>
            </div>
        </div>
    );

    if (!teacher) return (
        <div className="max-w-4xl mx-auto mt-8 p-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
                Teacher not found
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center justify-center mx-auto"
                >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Back to List
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto mt-8 p-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Header */}
                <div className="bg-gray-800 p-4 text-white">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Teacher Details</h2>
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-gray-50 hover:bg-gray-100 text-gray-800 px-4 py-2 rounded flex items-center"
                        >
                            <i className="fas fa-arrow-left mr-2"></i>
                        </button>
                    </div>
                </div>

                {/* Teacher Information */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-50 p-4 rounded-md">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Personal Information</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="font-medium text-gray-600">Full Name</p>
                                <p className="text-lg">{teacher.full_name}</p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-600">Email</p>
                                <p className="text-lg">{teacher.email}</p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-600">Date of Birth</p>
                                <p className="text-lg">{formatDate(teacher.dateNaissance)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Professional Information</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="font-medium text-gray-600">Hiring Date</p>
                                <p className="text-lg">{formatDate(teacher.dateEmbauche)}</p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-600">Salary</p>
                                <p className="text-lg">${teacher.salary?.toLocaleString() || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subjects Section */}
                <div className="p-6 border-t">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Assigned Subjects</h3>
                        <div className="flex items-center space-x-2">
                            {successMessage && (
                                <span className="text-green-600">{successMessage}</span>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <div className="mb-6">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <select
                                value={selectedSubject}
                                onChange={(e) => {
                                    setSelectedSubject(e.target.value);
                                    setError("");
                                }}
                                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={isLoading}
                            >
                                <option value="">Select a subject to add</option>
                                {allSubjects
                                    .filter(subject => !subjects.some(s => s.id === subject.id))
                                    .sort((a, b) => a.name.localeCompare(b.name))
                                    .map(subject => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name} / {subject.semester.year.filier.name}
                                        </option>
                                    ))}
                            </select>
                            <button
                                onClick={handleAttachSubject}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 flex items-center justify-center"
                                disabled={isLoading || !selectedSubject}
                            >
                                {isLoading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                        Adding...
                                    </>
                                ) : (
                                    "Add Subject"
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border">
                        {subjects.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No subjects assigned yet
                            </div>
                        ) : (
                            <ul className="divide-y">
                                {subjects.map(subject => (
                                    <li key={subject.id} className="p-4 hover:bg-gray-50">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{subject.name} <span className="text-gray-400">- {subject.semester.year.filier.name} </span></p>
                                                {subject.description && (
                                                    <p className="text-sm text-gray-600 mt-1">{subject.description}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDetachSubject(subject.id)}
                                                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                                                title="Remove subject"
                                                disabled={isLoading}
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>


            </div>
        </div>
    );
};

export default ViewTeacher;