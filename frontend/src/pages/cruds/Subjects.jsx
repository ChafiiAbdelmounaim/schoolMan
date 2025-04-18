import { useState, useEffect } from "react";
import axios from "axios";
import FormItem from "../../components/form/FormItem.jsx";
import Input from "../../components/form/Input.jsx";
import FormMessage from "../../components/form/FormMessage.jsx";
import FormControl from "../../components/form/FormControl.jsx";
import FormLabel from "../../components/form/FormLabel.jsx";

const Subjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [name, setName] = useState("");
    const [semesterId, setSemesterId] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [filteredSubjects, setFilteredSubjects] = useState([]);

    const [semesters, setSemesters] = useState([]);


    useEffect(() => {
        setFilteredSubjects(
            subjects.filter(sub =>
                sub.name.toLowerCase().includes(searchQuery.toLowerCase()) || sub.semester.semName.toLowerCase().includes(searchQuery.toLowerCase()) || sub.semester.year.filier.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [searchQuery, subjects]);

    useEffect(() => {
        fetchSubjects();
        fetchSemesters();
    }, []);

    const fetchSubjects = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8000/api/subjects", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubjects(response.data);
        } catch (error) {
            console.error("Error fetching subjects:", error);
        }
    };

    const fetchSemesters = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8000/api/semesters", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSemesters(response.data);
        } catch (error) {
            console.error("Error fetching semesters:", error);
        }
    };


    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (editMode) {
                await axios.put(`http://localhost:8000/api/subjects/${editId}`, { name, semester_id: semesterId }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post("http://localhost:8000/api/subjects", { name, semester_id: semesterId }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            setName("");
            setSemesterId("");
            setEditMode(false);
            setEditId(null);
            fetchSubjects();
        } catch (error) {
            setMessage("Error saving subject.");
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (subject) => {
        setName(subject.name);
        setSemesterId(subject.semester_id || "");
        setEditMode(true);
        setEditId(subject.id);
        document.getElementById("createForm").classList.remove("hidden");
    };

    const handleCancelEdit = () => {
        setName("");
        setSemesterId("");
        setEditMode(false);
        setEditId(null);
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8000/api/subjects/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchSubjects();
        } catch (error) {
            console.error("Error deleting subject:", error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-16 p-6 border rounded-md shadow-md">
            <h2 className="text-2xl font-bold text-center mb-8">Subjects</h2>
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => {
                        document.getElementById("createForm").classList.toggle("hidden");
                        handleCancelEdit();
                    }}
                    className="mb-4 bg-green-600 text-white px-4 py-2 rounded"
                >
                    {editMode ? "Cancel Edit" : "Create Subject"}
                </button>
                <input
                    type="text"
                    placeholder="Search subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="p-2 border rounded-md"
                />

            </div>
            <form id="createForm" onSubmit={handleSubmit} className="hidden mb-6">
                <FormMessage message={message} />
                <FormItem>
                    <FormLabel>Subject Name</FormLabel>
                    <FormControl>
                        <Input
                            type="text"
                            placeholder="Enter subject name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </FormControl>
                </FormItem>
                <FormItem>
                    <FormLabel>Semester</FormLabel>
                    <FormControl>
                        <select
                            value={semesterId}
                            onChange={(e) => setSemesterId(e.target.value)}
                            className="p-2 border rounded-md w-full"
                            required
                        >
                            <option value="">Select a Semester</option>
                            {semesters.map((semester) => (
                                <option key={semester.id} value={semester.id}>
                                    {`${semester.year.filier.name} ${semester.year.year_number} / ${semester.semName}`}
                                </option>
                            ))}
                        </select>
                    </FormControl>
                </FormItem>

                <button
                    type="submit"
                    className="bg-green-600 text-white p-2 rounded-md mt-4 w-full hover:bg-gray-600 flex items-center justify-center"
                    disabled={isLoading}
                >
                    {isLoading ? "Loading..." : editMode ? "Update Subject" : "Add Subject"}
                </button>
            </form>

            <table className="w-full border-collapse border border-gray-300">
                <thead>
                <tr className="bg-indigo-200">
                    <th className="border p-2">ID</th>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">Filier</th>
                    <th className="border p-2">Semester</th>
                    <th className="border p-2">Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredSubjects.map((subject) => (
                    <tr key={subject.id} className="text-center">
                        <td className="border p-2">{subject.id}</td>
                        <td className="border p-2">{subject.name}</td>
                        <td className="border p-2">
                            {subject.semester ? `${subject.semester.year.filier.name} ${subject.semester.year.year_number}` : "-"}
                        </td>
                        <td className="border p-2">{subject.semester ?  subject.semester.semName : "-"}</td>
                        <td className="border p-2">
                            <button
                                onClick={() => handleEdit(subject)}
                                className="text-white px-3 py-1 rounded mr-2"
                            >

                                <i className="fa-sharp fa-solid fa-pencil" style={{color: "#4f46e5"}}></i>
                            </button>

                            <button
                                onClick={() => handleDelete(subject.id)}
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

export default Subjects;
