import { useState, useEffect } from "react";
import axios from "axios";
import FormItem from "../../components/form/FormItem.jsx";
import Input from "../../components/form/Input.jsx";
import FormMessage from "../../components/form/FormMessage.jsx";
import FormControl from "../../components/form/FormControl.jsx";
import FormLabel from "../../components/form/FormLabel.jsx";

const Display = () => {
    const [timetables, setTimetables] = useState([]);
    const [courseId, setCourseId] = useState("");
    const [teacherId, setTeacherId] = useState("");
    const [classroomId, setClassroomId] = useState("");
    const [semesterId, setSemesterId] = useState("");
    const [day, setDay] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [filteredTimetables, setFilteredTimetables] = useState([]);

    useEffect(() => {
        setFilteredTimetables(
            timetables.filter(timetable =>
                timetable.day.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [searchQuery, timetables]);

    useEffect(() => {
        fetchTimetables();
    }, []);

    const fetchTimetables = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8000/api/timetables", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTimetables(response.data);
        } catch (error) {
            console.error("Error fetching timetables:", error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (editMode) {
                await axios.put(`http://localhost:8000/api/timetables/${editId}`, {
                    courseId,
                    teacherId,
                    classroomId,
                    semesterId,
                    day,
                    startTime,
                    endTime
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage("Timetable updated successfully!");
            } else {
                await axios.post("http://localhost:8000/api/timetables", {
                    courseId,
                    teacherId,
                    classroomId,
                    semesterId,
                    day,
                    startTime,
                    endTime
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage("Timetable added successfully!");
            }
            setCourseId("");
            setTeacherId("");
            setClassroomId("");
            setSemesterId("");
            setDay("");
            setStartTime("");
            setEndTime("");
            setEditMode(false);
            setEditId(null);
            fetchTimetables();
        } catch (error) {
            setMessage("Error saving timetable.");
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (timetable) => {
        setCourseId(timetable.course_id);
        setTeacherId(timetable.teacher_id);
        setClassroomId(timetable.classroom_id);
        setSemesterId(timetable.semester_id);
        setDay(timetable.day);
        setStartTime(timetable.start_time);
        setEndTime(timetable.end_time);
        setEditMode(true);
        setEditId(timetable.id);
        document.getElementById("createForm").classList.remove("hidden");
    };

    const handleCancelEdit = () => {
        setCourseId("");
        setTeacherId("");
        setClassroomId("");
        setSemesterId("");
        setDay("");
        setStartTime("");
        setEndTime("");
        setEditMode(false);
        setEditId(null);
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8000/api/timetables/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTimetables();
        } catch (error) {
            console.error("Error deleting timetable:", error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-16 p-6 border rounded-md shadow-md">
            <h2 className="text-2xl font-bold text-center mb-8">Timetables</h2>
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => {
                        document.getElementById("createForm").classList.toggle("hidden");
                        handleCancelEdit();
                    }}
                    className="mb-4 bg-green-600 text-white px-4 py-2 rounded"
                >
                    {editMode ? "Cancel Edit" : "Create Timetable"}
                </button>
                <input
                    type="text"
                    placeholder="Search timetables..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="p-2 border rounded-md"
                />
            </div>
            <form id="createForm" onSubmit={handleSubmit} className="hidden mb-6">
                <FormMessage message={message} />
                <FormItem>
                    <FormLabel>Course</FormLabel>
                    <FormControl>
                        <Input
                            type="text"
                            placeholder="Enter course"
                            value={courseId}
                            onChange={(e) => setCourseId(e.target.value)}
                            required
                        />
                    </FormControl>
                </FormItem>
                <FormItem>
                    <FormLabel>Teacher</FormLabel>
                    <FormControl>
                        <Input
                            type="text"
                            placeholder="Enter teacher"
                            value={teacherId}
                            onChange={(e) => setTeacherId(e.target.value)}
                            required
                        />
                    </FormControl>
                </FormItem>
                <FormItem>
                    <FormLabel>Classroom</FormLabel>
                    <FormControl>
                        <Input
                            type="text"
                            placeholder="Enter classroom"
                            value={classroomId}
                            onChange={(e) => setClassroomId(e.target.value)}
                            required
                        />
                    </FormControl>
                </FormItem>
                <FormItem>
                    <FormLabel>Semester</FormLabel>
                    <FormControl>
                        <Input
                            type="text"
                            placeholder="Enter semester"
                            value={semesterId}
                            onChange={(e) => setSemesterId(e.target.value)}
                            required
                        />
                    </FormControl>
                </FormItem>
                <FormItem>
                    <FormLabel>Day</FormLabel>
                    <FormControl>
                        <Input
                            type="text"
                            placeholder="Enter day"
                            value={day}
                            onChange={(e) => setDay(e.target.value)}
                            required
                        />
                    </FormControl>
                </FormItem>
                <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                        <Input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                        />
                    </FormControl>
                </FormItem>
                <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                        <Input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            required
                        />
                    </FormControl>
                </FormItem>
                <button
                    type="submit"
                    className="bg-green-600 text-white p-2 rounded-md mt-4 w-full hover:bg-gray-600 flex items-center justify-center"
                    disabled={isLoading}
                >
                    {isLoading ? "Loading..." : editMode ? "Update Timetable" : "Add Timetable"}
                </button>
            </form>

            <table className="w-full border-collapse border border-gray-300">
                <thead>
                <tr className="bg-indigo-200">
                    <th className="border p-2">ID</th>
                    <th className="border p-2">Course</th>
                    <th className="border p-2">Teacher</th>
                    <th className="border p-2">Classroom</th>
                    <th className="border p-2">Semester</th>
                    <th className="border p-2">Day</th>
                    <th className="border p-2">Start Time</th>
                    <th className="border p-2">End Time</th>
                    <th className="border p-2">Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredTimetables.map((timetable) => (
                    <tr key={timetable.id} className="text-center">
                        <td className="border p-2">{timetable.id}</td>
                        <td className="border p-2">{timetable.course.name}</td>
                        <td className="border p-2">{timetable.teacher.full_name}</td>
                        <td className="border p-2">{timetable.classroom.name}</td>
                        <td className="border p-2">{timetable.semester.semName}</td>
                        <td className="border p-2">{timetable.day}</td>
                        <td className="border p-2">{timetable.start_time}</td>
                        <td className="border p-2">{timetable.end_time}</td>
                        <td className="border p-2">
                            <button
                                onClick={() => handleEdit(timetable)}
                                className="text-white px-3 py-1 rounded mr-2"
                            >
                                <i className="fa-sharp fa-solid fa-pencil" style={{color: "#4f46e5"}}></i>
                            </button>
                            <button
                                onClick={() => handleDelete(timetable.id)}
                                className="text-white px-3 py-1 rounded"
                            >
                                <i className="fa-sharp fa-solid fa-trash" style={{ color: "#4f46e5" }}></i>
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Display;
