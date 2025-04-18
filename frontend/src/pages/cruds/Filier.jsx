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

    const [searchQuery, setSearchQuery] = useState("");
    const [filteredFiliers, setFilteredFiliers] = useState([]);

    useEffect(() => {
        setFilteredFiliers(
            filiers.filter(filier =>
                filier.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [searchQuery, filiers]);

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
            setName("");
            setEditMode(false);
            setEditId(null);
            fetchFiliers();
        } catch (error) {
            setMessage("Error saving filier.");
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (filier) => {
        setName(filier.name);
        setEditMode(true);
        setEditId(filier.id);
        document.getElementById("createForm").classList.remove("hidden");
    };

    const handleCancelEdit = () => {
        setName("");
        setEditMode(false);
        setEditId(null);
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8000/api/filiers/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFiliers();
        } catch (error) {
            console.error("Error deleting filier:", error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-16 p-6 border rounded-md shadow-md">
            <h2 className="text-2xl font-bold text-center mb-8">Filiers</h2>
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => {
                        document.getElementById("createForm").classList.toggle("hidden");
                        handleCancelEdit();
                    }}
                    className="mb-4 bg-green-600 text-white px-4 py-2 rounded"
                >
                    {editMode ? "Cancel Edit" : "Create Filier"}
                </button>
                <input
                    type="text"
                    placeholder="Search filiers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="p-2 border rounded-md"
                />
            </div>
            <form id="createForm" onSubmit={handleSubmit} className="hidden mb-6">
                <FormMessage message={message} />
                <FormItem>
                    <FormLabel>Filier Name</FormLabel>
                    <FormControl>
                        <Input
                            type="text"
                            placeholder="Enter filier name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </FormControl>
                </FormItem>
                <button
                    type="submit"
                    className="bg-green-600 text-white p-2 rounded-md mt-4 w-full hover:bg-gray-600 flex items-center justify-center"
                    disabled={isLoading}
                >
                    {isLoading ? "Loading..." : editMode ? "Update Filier" : "Add Filier"}
                </button>
            </form>

            <table className="w-full border-collapse border border-gray-300">
                <thead>
                <tr className="bg-indigo-200">
                    <th className="border p-2">ID</th>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredFiliers.map((filier) => (
                    <tr key={filier.id} className="text-center">
                        <td className="border p-2">{filier.id}</td>
                        <td className="border p-2">{filier.name}</td>
                        <td className="border p-2">
                            <button
                                onClick={() => handleEdit(filier)}
                                className="text-white px-3 py-1 rounded mr-2"
                            >
                                <i className="fa-sharp fa-solid fa-pencil" style={{color: "#4f46e5"}}></i>
                            </button>
                            <button
                                onClick={() => handleDelete(filier.id)}
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

export default Filier;
