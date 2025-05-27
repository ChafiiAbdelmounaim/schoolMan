import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = [
    { label: '09:00 - 12:00', start: '09:00:00', end: '12:00:00' },
    { label: '14:00 - 17:00', start: '14:00:00', end: '17:00:00' }
];

const EditTimetable = () => {
    const { semesterId } = useParams();
    const navigate = useNavigate();

    // Data states
    const [timetableData, setTimetableData] = useState([]);
    const [semesterInfo, setSemesterInfo] = useState({});
    const [editOptions, setEditOptions] = useState({
        courses: [],
        teachers: [],
        classrooms: []
    });

    // UI states
    const [loading, setLoading] = useState(true);
    const [loadingTimeout, setLoadingTimeout] = useState(false);
    const [optionsLoading, setOptionsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Edit states
    const [editingCell, setEditingCell] = useState(null);
    const [editValues, setEditValues] = useState({
        course_id: '',
        teacher_id: '',
        classroom_id: ''
    });
    const [saving, setSaving] = useState(false);

    // Constraint tracking
    const [usedSlots, setUsedSlots] = useState({
        global: {}, // classroom-day-time combinations
        semester: {}, // day-time combinations for this semester
        teacher: {}  // teacher-day-time combinations
    });

    // Initial data loading
    useEffect(() => {
        const fetchData = async () => {
            // Setup a timeout to detect slow loading
            const timeoutId = setTimeout(() => {
                setLoadingTimeout(true);
            }, 5000); // 5 seconds timeout

            try {
                console.log(`Fetching timetable for semester ID: ${semesterId}`);
                const token = localStorage.getItem("token");

                const res = await axios.get(`http://localhost:8000/api/timetable/${semesterId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 20000 // 20 seconds timeout
                });

                clearTimeout(timeoutId);

                if (res.data && Array.isArray(res.data)) {
                    setTimetableData(res.data);

                    // Extract semester info from the first entry
                    if (res.data.length > 0) {
                        const firstEntry = res.data[0];
                        setSemesterInfo({
                            program: firstEntry.semester?.year?.filier?.name || 'Unknown Program',
                            year: firstEntry.semester?.year?.year_number || '?',
                            semester: firstEntry.semester?.semName || '?'
                        });
                    }

                    // Initialize used slots tracking
                    initializeUsedSlots(res.data);

                    // Now fetch edit options (courses, teachers, classrooms)
                    fetchOptions();
                } else {
                    setError("Invalid data format received from server");
                }
            } catch (err) {
                clearTimeout(timeoutId);
                console.error("Error fetching timetable data:", err);

                let errorMessage = "An unknown error occurred";

                if (err.response) {
                    errorMessage = `Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`;
                } else if (err.request) {
                    errorMessage = "No response received from server. Network issue or server is down.";
                } else {
                    errorMessage = `Error: ${err.message}`;
                }

                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [semesterId]);

    // Initialize tracking of used slots
    const initializeUsedSlots = (data) => {
        const global = {}; // classroom-day-time
        const semester = {}; // day-time
        const teacher = {}; // teacher-day-time

        data.forEach(item => {
            // Global slot key (classroom-day-time)
            const globalKey = `${item.classroom_id}-${item.day}-${item.start_time}`;
            global[globalKey] = item.id;

            // Semester slot key (day-time)
            const semesterKey = `${item.day}-${item.start_time}`;
            semester[semesterKey] = item.id;

            // Teacher slot key (teacher-day-time)
            const teacherKey = `${item.teacher_id}-${item.day}-${item.start_time}`;
            teacher[teacherKey] = item.id;
        });

        setUsedSlots({ global, semester, teacher });
    };

    // Fetch options for editing (courses, teachers, classrooms)
    const fetchOptions = async () => {
        setOptionsLoading(true);

        try {
            const token = localStorage.getItem("token");

            // Parallel requests for better performance
            const [coursesRes, teachersRes, classroomsRes] = await Promise.all([
                axios.get('http://localhost:8000/api/courses', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:8000/api/teachers', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:8000/api/classrooms', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setEditOptions({
                courses: coursesRes.data || [],
                teachers: teachersRes.data || [],
                classrooms: classroomsRes.data || []
            });
        } catch (err) {
            console.error("Error fetching options:", err);
            // We don't set a fatal error here, just a warning
            setError(prev => prev || "Some edit options could not be loaded. Editing functionality may be limited.");
        } finally {
            setOptionsLoading(false);
        }
    };

    // Function to check for conflicts
    const checkAvailability = (values, originalId = null) => {
        // Global slot key (classroom-day-time)
        const globalKey = `${values.classroom_id}-${editingCell.day}-${editingCell.start}`;

        // Semester slot key (day-time)
        const semesterKey = `${editingCell.day}-${editingCell.start}`;

        // Teacher slot key (teacher-day-time)
        const teacherKey = `${values.teacher_id}-${editingCell.day}-${editingCell.start}`;

        // Check if classroom is already booked at this time
        const classroomBusy = usedSlots.global[globalKey] && usedSlots.global[globalKey] !== originalId;

        // Check if semester already has a class at this time
        const semesterTimeBusy = usedSlots.semester[semesterKey] && usedSlots.semester[semesterKey] !== originalId;

        // Check if teacher is already booked at this time
        const teacherBusy = usedSlots.teacher[teacherKey] && usedSlots.teacher[teacherKey] !== originalId;

        if (classroomBusy) {
            return "This classroom is already occupied during this time slot.";
        }

        if (semesterTimeBusy) {
            return "This semester already has a class scheduled during this time slot.";
        }

        if (teacherBusy) {
            return "This teacher is already teaching another class during this time slot.";
        }

        return null; // No conflicts
    };

    // Cell click handler for editing
    const handleCellClick = (day, slot, entry) => {
        // Clear any messages
        setError('');
        setSuccess('');

        if (entry) {
            // Editing existing entry
            setEditingCell({
                id: entry.id,
                day: day,
                start: slot.start,
                end: slot.end
            });

            // Pre-fill form with current values
            setEditValues({
                course_id: entry.course_id || '',
                teacher_id: entry.teacher_id || '',
                classroom_id: entry.classroom_id || ''
            });
        } else {
            // Adding new entry
            setEditingCell({
                id: null,
                day: day,
                start: slot.start,
                end: slot.end
            });

            // Reset form values
            setEditValues({
                course_id: '',
                teacher_id: '',
                classroom_id: ''
            });
        }
    };

    // Save handler for edits
    const handleSave = async () => {
        // Basic validation
        if (!editValues.course_id || !editValues.teacher_id || !editValues.classroom_id) {
            setError("Please fill in all fields.");
            return;
        }

        // Check for conflicts
        const availabilityError = checkAvailability(editValues, editingCell.id);
        if (availabilityError) {
            setError(availabilityError);
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem("token");
            const payload = {
                course_id: editValues.course_id,
                teacher_id: editValues.teacher_id,
                classroom_id: editValues.classroom_id,
                day: editingCell.day,
                start_time: editingCell.start,
                end_time: editingCell.end,
                semester_id: semesterId
            };

            let res;

            if (editingCell.id) {
                // Update existing entry
                res = await axios.put(`http://localhost:8000/api/timetable/${editingCell.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Update in local state
                const updatedData = [...timetableData];
                const index = updatedData.findIndex(item => item.id === editingCell.id);

                if (index !== -1) {
                    updatedData[index] = res.data;
                    setTimetableData(updatedData);
                    initializeUsedSlots(updatedData);
                }

                setSuccess("Class updated successfully!");
            } else {
                // Create new entry
                res = await axios.post('http://localhost:8000/api/timetable', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Add to local state
                const updatedData = [...timetableData, res.data];
                setTimetableData(updatedData);
                initializeUsedSlots(updatedData);

                setSuccess("New class added successfully!");
            }

            // Reset editing state
            setEditingCell(null);
        } catch (err) {
            console.error("Error saving:", err);

            let errorMessage = "Failed to save changes.";
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    // Cancel edit handler
    const handleCancel = () => {
        setEditingCell(null);
        setError('');
    };

    // Delete handler
    const handleDelete = async () => {
        if (!editingCell.id) {
            // Nothing to delete for a new entry
            setEditingCell(null);
            return;
        }

        if (!window.confirm("Are you sure you want to delete this class?")) {
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8000/api/timetable/${editingCell.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove from local state
            const updatedData = timetableData.filter(item => item.id !== editingCell.id);
            setTimetableData(updatedData);
            initializeUsedSlots(updatedData);

            setEditingCell(null);
            setSuccess("Class deleted successfully!");
        } catch (err) {
            console.error("Error deleting:", err);

            let errorMessage = "Failed to delete class.";
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    // Render the edit form
    const renderEditForm = () => {
        if (optionsLoading) {
            return <div className="p-3 text-center">Loading options...</div>;
        }

        return (
            <div className="p-3">
                <div className="mb-2">
                    <label className="block text-xs text-gray-600 mb-1">Course</label>
                    <select
                        className="w-full p-1 text-sm border rounded"
                        value={editValues.course_id}
                        onChange={(e) => setEditValues({...editValues, course_id: e.target.value})}
                    >
                        <option value="">Select Course</option>
                        {editOptions.courses.map(course => (
                            <option key={course.id} value={course.id}>{course.name}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-2">
                    <label className="block text-xs text-gray-600 mb-1">Teacher</label>
                    <select
                        className="w-full p-1 text-sm border rounded"
                        value={editValues.teacher_id}
                        onChange={(e) => setEditValues({...editValues, teacher_id: e.target.value})}
                    >
                        <option value="">Select Teacher</option>
                        {editOptions.teachers.map(teacher => (
                            <option key={teacher.id} value={teacher.id}>{teacher.full_name}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="block text-xs text-gray-600 mb-1">Classroom</label>
                    <select
                        className="w-full p-1 text-sm border rounded"
                        value={editValues.classroom_id}
                        onChange={(e) => setEditValues({...editValues, classroom_id: e.target.value})}
                    >
                        <option value="">Select Classroom</option>
                        {editOptions.classrooms.map(classroom => (
                            <option key={classroom.id} value={classroom.id}>{classroom.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-between">
                    <button
                        onClick={handleCancel}
                        className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                    >
                        Cancel
                    </button>

                    {editingCell.id && (
                        <button
                            onClick={handleDelete}
                            className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded"
                            disabled={saving}
                        >
                            {saving ? "Deleting..." : "Delete"}
                        </button>
                    )}

                    <button
                        onClick={handleSave}
                        className="px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded"
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        );
    };

    // Cell content renderer
    const getCellContent = (day, slot) => {
        const entry = timetableData.find(item =>
            item.day === day &&
            item.start_time === slot.start &&
            item.end_time === slot.end
        );

        // If cell is being edited
        if (editingCell &&
            editingCell.day === day &&
            editingCell.start === slot.start &&
            (editingCell.id === (entry?.id || null))) {

            return {
                content: renderEditForm(),
                className: "bg-blue-50 p-0"
            };
        }

        // Empty cell
        if (!entry) {
            return {
                content: (
                    <div
                        className="h-full w-full flex items-center justify-center cursor-pointer"
                        onClick={() => handleCellClick(day, slot, null)}
                    >
                        <span className="text-gray-400 text-sm">+</span>
                    </div>
                ),
                className: "bg-white hover:bg-gray-50"
            };
        }

        // Cell with data
        return {
            content: (
                <div
                    className="text-sm text-gray-800 leading-5 cursor-pointer"
                    onClick={() => handleCellClick(day, slot, entry)}
                >
                    <div><strong>{entry.course?.name || 'N/A'}</strong></div>
                    <div>{entry.teacher?.full_name || 'N/A'}</div>
                    <div>{entry.classroom?.name || 'N/A'}</div>
                </div>
            ),
            className: "bg-blue-100 hover:bg-blue-200"
        };
    };

    // Loading screen
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 text-xl">⏳ Loading timetable...</div>

                {loadingTimeout && (
                    <div className="mt-4 text-red-600 max-w-md">
                        <p className="font-bold">Taking longer than expected!</p>
                        <p className="text-sm mt-2">This could be due to:</p>
                        <ul className="text-sm mt-1 list-disc text-left pl-6">
                            <li>Slow server response</li>
                            <li>Network connectivity issues</li>
                            <li>Large amount of timetable data</li>
                        </ul>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 ml-3 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            Retry
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // Error screen
    if (error && !timetableData.length) {
        return (
            <div className="p-6 max-w-md mx-auto mt-16 bg-red-50 border border-red-200 rounded-md">
                <h2 className="text-xl font-bold text-red-700 mb-4">Error Loading Timetable</h2>
                <p className="mb-4 text-red-600">{error}</p>
                <div className="flex justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={() => {
                            setLoading(true);
                            setError('');
                            setLoadingTimeout(false);
                            window.location.reload();
                        }}
                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Main timetable editor view
    return (
        <div className="max-w-4xl mx-auto mt-16 p-6">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Back
                </button>

                <h2 className="text-2xl font-bold">
                    Edit Timetable
                </h2>

                <div className="w-24"></div> {/* Empty space for balance */}
            </div>

            {/* Success and error messages */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
                    {success}
                </div>
            )}

            {/* Timetable info */}
            <div className="mb-4 border rounded-md shadow-sm">
                <h3 className="text-xl font-semibold p-4 bg-gray-50 rounded-t-md">
                    {semesterInfo.program} - Year {semesterInfo.year} - Semester {semesterInfo.semester}
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

            {/* Instructions */}
            <div className="mt-6 bg-gray-50 p-4 rounded-md">
                <h4 className="font-semibold mb-2">Editing Instructions:</h4>
                <ul className="list-disc pl-5 text-sm">
                    <li>Click on any cell to add or edit a class.</li>
                    <li>Each time slot can only have one class per semester.</li>
                    <li>Each classroom can only be used once per time slot.</li>
                    <li>Each teacher can only teach one class at a time.</li>
                    <li>All fields (course, teacher, and classroom) are required.</li>
                </ul>
            </div>
        </div>
    );
};

export default EditTimetable;