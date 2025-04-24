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
            setMessage("Error fetching semesters");
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
            setMessage("Error fetching years");
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (editMode) {
                await axios.put(`http://localhost:8000/api/semesters/${editId}`, {
                    semName,
                    year_id: yearId
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage("Semester updated successfully!");
            } else {
                await axios.post("http://localhost:8000/api/semesters", {
                    semName,
                    year_id: yearId
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage("Semester added successfully!");
            }
            resetForm();
            fetchSemesters();
        } catch (error) {
            console.error("Error:", error);
            setMessage(error.response?.data?.message || "Error saving semester");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setSemName("");
        setYearId("");
        setEditMode(false);
        setEditId(null);
        setFormVisible(false);
    };

    const handleEdit = (semester) => {
        setSemName(semester.semName);
        setYearId(semester.year_id);
        setEditMode(true);
        setEditId(semester.id);
        setFormVisible(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this semester?")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8000/api/semesters/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage("Semester deleted successfully");
            fetchSemesters();
        } catch (error) {
            console.error("Error deleting semester:", error);
            setMessage("Error deleting semester");
        }
    };

    const filteredSemesters = semesters.filter(semester =>
        semester.semName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (semester.year?.filier?.name && semester.year.filier.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Semesters Management</h1>

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFormVisible(!formVisible)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition flex items-center gap-2"
                    >
                        {formVisible ? (
                            <>
                                <i className="fas fa-times"></i> Hide Form
                            </>
                        ) : (
                            <>
                                <i className="fas fa-plus"></i> Create Semester
                            </>
                        )}
                    </button>
                </div>

                <div className="relative w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search semesters..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                </div>
            </div>

            {/* Status Messages */}
            {message && (
                <div className={`mb-6 p-4 rounded ${message.includes('Success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="flex items-center gap-2">
                        {message.includes('Success') ? (
                            <i className="fas fa-check-circle"></i>
                        ) : (
                            <i className="fas fa-exclamation-circle"></i>
                        )}
                        <span>{message}</span>
                    </div>
                </div>
            )}

            {/* Semester Form */}
            {formVisible && (
                <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg shadow-inner">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">
                        {editMode ? "Edit Semester" : "Add New Semester"}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormItem>
                            <FormLabel>Semester Name</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    placeholder="Semester name"
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
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Select Year</option>
                                    {years.map((year) => (
                                        <option key={year.id} value={year.id}>
                                            {year.filier?.name ? `${year.filier.name} - Year ${year.year_number}` : `Year ${year.year_number}`}
                                        </option>
                                    ))}
                                </select>
                            </FormControl>
                        </FormItem>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-md text-white transition ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isLoading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-2"></i>
                                    Processing...
                                </>
                            ) : editMode ? (
                                "Update Semester"
                            ) : (
                                "Add Semester"
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* Semesters Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-800">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Semester Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Program</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSemesters.length > 0 ? (
                        filteredSemesters.map((semester) => (
                            <tr key={semester.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{semester.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {semester.semName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {semester.year?.filier?.name || '-'} {semester.year.year_number}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(semester)}
                                            className="text-blue-600 hover:text-blue-900"
                                            title="Edit"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(semester.id)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Delete"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                {semesters.length === 0 ? "No semesters found in database" : "No semesters match your search"}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Semesters;