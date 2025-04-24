import { useState, useEffect } from "react";
import axios from "axios";
import FormItem from "../../components/form/FormItem.jsx";
import Input from "../../components/form/Input.jsx";
import FormMessage from "../../components/form/FormMessage.jsx";
import FormControl from "../../components/form/FormControl.jsx";
import FormLabel from "../../components/form/FormLabel.jsx";

const Filier = () => {
    const [filiers, setFiliers] = useState([]);
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formVisible, setFormVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredFiliers = filiers.filter(filier =>
        filier.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        fetchFiliers();
    }, []);

    const fetchFiliers = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8000/api/filiers", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFiliers(response.data);
        } catch (error) {
            console.error("Error fetching filiers:", error);
            setMessage("Error fetching filiers");
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (editMode) {
                await axios.put(`http://localhost:8000/api/filiers/${editId}`, { name }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage("Filier updated successfully!");
            } else {
                await axios.post("http://localhost:8000/api/filiers", { name }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage("Filier added successfully!");
            }
            resetForm();
            fetchFiliers();
        } catch (error) {
            setMessage(error.response?.data?.message || "Error saving filier");
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setName("");
        setEditMode(false);
        setEditId(null);
        setFormVisible(false);
    };

    const handleEdit = (filier) => {
        setName(filier.name);
        setEditMode(true);
        setEditId(filier.id);
        setFormVisible(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this filier?")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8000/api/filiers/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage("Filier deleted successfully");
            fetchFiliers();
        } catch (error) {
            console.error("Error deleting filier:", error);
            setMessage("Error deleting filier");
        }
    };

    return (
        <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Filiers Management</h1>

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex gap-2">
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
                                <i className="fas fa-plus"></i> Create Filier
                            </>
                        )}
                    </button>
                </div>

                <div className="relative w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search filiers..."
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

            {/* Filier Form */}
            {formVisible && (
                <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg shadow-inner">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">
                        {editMode ? "Edit Filier" : "Add New Filier"}
                    </h2>

                    <div className="grid grid-cols-1 gap-6">
                        <FormItem>
                            <FormLabel>Filier Name</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    placeholder="Filier name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
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
                                "Update Filier"
                            ) : (
                                "Add Filier"
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* Filiers Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-800">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFiliers.length > 0 ? (
                        filteredFiliers.map((filier) => (
                            <tr key={filier.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{filier.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {filier.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(filier)}
                                            className="text-blue-600 hover:text-blue-900"
                                            title="Edit"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(filier.id)}
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
                            <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                                {filiers.length === 0 ? "No filiers found in database" : "No filiers match your search"}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Filier;