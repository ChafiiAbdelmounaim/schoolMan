import { useState, useEffect } from "react";
import axios from "axios";
import FormItem from "../../components/form/FormItem.jsx";
import Input from "../../components/form/Input.jsx";
import FormMessage from "../../components/form/FormMessage.jsx";
import FormControl from "../../components/form/FormControl.jsx";
import FormLabel from "../../components/form/FormLabel.jsx";

const Semesters = () => {
    const [semesters, setSemesters] = useState([]);
    const [years, setYears] = useState([]);
    const [semName, setSemName] = useState("");
    const [yearId, setYearId] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formVisible, setFormVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchSemesters();
        fetchYears();
    }, []);

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

    const fetchYears = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8000/api/years", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setYears(response.data);
        } catch (error) {
            console.error("Error fetching years:", error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (editMode) {
                await axios.put(`http://localhost:8000/api/semesters/${editId}`, { semName, year_id: yearId }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage("Semester updated successfully!");
            } else {
                await axios.post("http://localhost:8000/api/semesters", { semName, year_id: yearId }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage("Semester added successfully!");
            }
            setSemName("");
            setYearId("");
            setEditMode(false);
            setEditId(null);
            setFormVisible(false);
            fetchSemesters();
        } catch (error) {
            setMessage("Error saving semester.");
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (semester) => {
        setSemName(semester.semName);
        setYearId(semester.year_id);
        setEditMode(true);
        setEditId(semester.id);
        setFormVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8000/api/semesters/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchSemesters();
        } catch (error) {
            console.error("Error deleting semester:", error);
        }
    };

    const filteredSemesters = semesters.filter(semester =>
        semester.year && semester.year.filier.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-4xl mx-auto mt-16 p-6 border rounded-md shadow-md">
            <h2 className="text-2xl font-bold text-center mb-8">Semesters</h2>
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => setFormVisible(!formVisible)}
                    className="mb-4 bg-green-600 text-white px-4 py-2 rounded"
                >
                    {formVisible ? "Hide Form" : "Create Semester"}
                </button>
                <input
                    type="text"
                    placeholder="Search by filier name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="p-2 border rounded-md"
                />
            </div>
            {formVisible && (
                <form onSubmit={handleSubmit} className="mb-6">
                    <FormMessage message={message} />
                    <FormItem>
                        <FormLabel>Semester Name</FormLabel>
                        <FormControl>
                            <Input
                                type="text"
                                placeholder="Enter semester name"
                                value={semName}
                                onChange={(e) => setSemName(e.target.value)}
                                required
                            />
                        </FormControl>
                    </FormItem>
                    <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                            <select
                                value={yearId}
                                onChange={(e) => setYearId(e.target.value)}
                                className="p-2 border rounded-md w-full"
                                required
                            >
                                <option value="">Select a Year</option>
                                {years.map((year) => (
                                    <option key={year.id} value={year.id}>
                                        {year.filier ? `${year.filier.name} ${year.year_number}` : year.year_number}
                                    </option>
                                ))}
                            </select>
                        </FormControl>
                    </FormItem>
                    <button
                        type="submit"
                        className="bg-green-600 text-white p-2 rounded-md mt-4 w-full hover:bg-gray-600"
                        disabled={isLoading}
                    >
                        {isLoading ? "Loading..." : editMode ? "Update Semester" : "Add Semester"}
                    </button>
                </form>
            )}
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                <tr className="bg-indigo-200">
                    <th className="border p-2">ID</th>
                    <th className="border p-2">Semester Name</th>
                    <th className="border p-2">Year</th>
                    <th className="border p-2">Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredSemesters.map((semester) => (
                    <tr key={semester.id} className="text-center">
                        <td className="border p-2">{semester.id}</td>
                        <td className="border p-2">{semester.semName}</td>
                        <td className="border p-2">{semester.year ? `${semester.year.filier.name} ${semester.year.year_number}` : "-"}</td>
                        <td className="border p-2">
                            <button onClick={() => handleEdit(semester)} className="text-blue-500 mr-2">
                                <i className="fa-sharp fa-solid fa-pencil" style={{color: "#4f46e5"}}></i>
                            </button>
                            <button onClick={() => handleDelete(semester.id)} className="text-red-500">
                                <i className="fa-sharp fa-solid fa-trash" style={{color: "#4f46e5"}}></i>
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Semesters;