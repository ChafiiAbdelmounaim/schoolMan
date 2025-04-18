import { useState, useEffect } from "react";
import axios from "axios";
import FormItem from "../../components/form/FormItem.jsx";
import Input from "../../components/form/Input.jsx";
import FormMessage from "../../components/form/FormMessage.jsx";
import FormControl from "../../components/form/FormControl.jsx";
import FormLabel from "../../components/form/FormLabel.jsx";

const Classrooms = () => {
    const [classrooms, setClassrooms] = useState([]);
    const [name, setName] = useState("");
    const [capacity, setCapacity] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [filteredClassrooms, setFilteredClassrooms] = useState([]);

    useEffect(() => {
        setFilteredClassrooms(
            classrooms.filter(classroom =>
                classroom.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [searchQuery, classrooms]);

    useEffect(() => {
        fetchClassrooms();
    }, []);

    const fetchClassrooms = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8000/api/classrooms", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClassrooms(response.data);
        } catch (error) {
            console.error("Error fetching classrooms:", error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (editMode) {
                await axios.put(`http://localhost:8000/api/classrooms/${editId}`, { name, capacity }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage("Classroom updated successfully!");
            } else {
                await axios.post("http://localhost:8000/api/classrooms", { name, capacity }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage("Classroom added successfully!");
            }
            setName("");
            setCapacity("");
            setEditMode(false);
            setEditId(null);
            fetchClassrooms();
        } catch (error) {
            setMessage("Error saving classroom.");
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (classroom) => {
        setName(classroom.name);
        setCapacity(classroom.capacity);
        setEditMode(true);
        setEditId(classroom.id);
        document.getElementById("createForm").classList.remove("hidden");
    };

    const handleCancelEdit = () => {
        setName("");
        setCapacity("");
        setEditMode(false);
        setEditId(null);
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8000/api/classrooms/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchClassrooms();
        } catch (error) {
            console.error("Error deleting classroom:", error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-16 p-6 border rounded-md shadow-md">
            <h2 className="text-2xl font-bold text-center mb-8">Classrooms</h2>
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => {
                        document.getElementById("createForm").classList.toggle("hidden");
                        handleCancelEdit();
                    }}
                    className="mb-4 bg-green-600 text-white px-4 py-2 rounded"
                >
                    {editMode ? "Cancel Edit" : "Create Classroom"}
                </button>
                <input
                    type="text"
                    placeholder="Search classrooms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="p-2 border rounded-md"
                />
            </div>
            <form id="createForm" onSubmit={handleSubmit} className="hidden mb-6">
                <FormMessage message={message} />
                <FormItem>
                    <FormLabel>Classroom Name</FormLabel>
                    <FormControl>
                        <Input
                            type="text"
                            placeholder="Enter classroom name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </FormControl>
                </FormItem>
                <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                        <Input
                            type="number"
                            placeholder="Enter classroom capacity"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            required
                        />
                    </FormControl>
                </FormItem>
                <button
                    type="submit"
                    className="bg-green-600 text-white p-2 rounded-md mt-4 w-full hover:bg-gray-600 flex items-center justify-center"
                    disabled={isLoading}
                >
                    {isLoading ? "Loading..." : editMode ? "Update Classroom" : "Add Classroom"}
                </button>
            </form>

            <table className="w-full border-collapse border border-gray-300">
                <thead>
                <tr className="bg-indigo-200">
                    <th className="border p-2">ID</th>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">Capacity</th>
                    <th className="border p-2">Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredClassrooms.map((classroom) => (
                    <tr key={classroom.id} className="text-center">
                        <td className="border p-2">{classroom.id}</td>
                        <td className="border p-2">{classroom.name}</td>
                        <td className="border p-2">{classroom.capacity}</td>
                        <td className="border p-2">
                            <button
                                onClick={() => handleEdit(classroom)}
                                className="text-white px-3 py-1 rounded mr-2"
                            >
                                <i className="fa-sharp fa-solid fa-pencil" style={{color: "#4f46e5"}}></i>
                            </button>
                            <button
                                onClick={() => handleDelete(classroom.id)}
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

export default Classrooms;
