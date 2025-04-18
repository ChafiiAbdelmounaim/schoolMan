import { useState, useEffect } from "react";
import axios from "axios";
import FormItem from "../../components/form/FormItem.jsx";
import Input from "../../components/form/Input.jsx";
import FormMessage from "../../components/form/FormMessage.jsx";
import FormControl from "../../components/form/FormControl.jsx";
import FormLabel from "../../components/form/FormLabel.jsx";

const Year = () => {
    const [years, setYears] = useState([]);
    const [filiers, setFiliers] = useState([]);
    const [yearNumber, setYearNumber] = useState("");
    const [filierId, setFilierId] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formVisible, setFormVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredYears = years.filter(year =>
        year.filier && year.filier.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        fetchYears();
        fetchFiliers();
    }, []);

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
                await axios.put(`http://localhost:8000/api/years/${editId}`, { year_number: yearNumber, filier_id: filierId }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage("Year updated successfully!");
            } else {
                await axios.post("http://localhost:8000/api/years", { year_number: yearNumber, filier_id: filierId }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage("Year added successfully!");
            }
            setYearNumber("");
            setFilierId("");
            setEditMode(false);
            setEditId(null);
            setFormVisible(false);
            fetchYears();
        } catch (error) {
            setMessage("Error saving year.");
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (year) => {
        setYearNumber(year.year_number);
        setFilierId(year.filier_id);
        setEditMode(true);
        setEditId(year.id);
        setFormVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8000/api/years/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchYears();
        } catch (error) {
            console.error("Error deleting year:", error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-16 p-6 border rounded-md shadow-md">
            <h2 className="text-2xl font-bold text-center mb-8">Years</h2>
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => {
                        setFormVisible(!formVisible);
                        if (editMode) {
                            setEditMode(false);
                            setEditId(null);
                            setYearNumber("");
                            setFilierId("");
                        }
                    }}
                    className="mb-4 bg-green-600 text-white px-4 py-2 rounded"
                >
                    {editMode ? "Cancel Edit" : formVisible ? "Hide Form" : "Create Year"}
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
                        <FormLabel>Year Number</FormLabel>
                        <FormControl>
                            <Input
                                type="text"
                                placeholder="Enter year number"
                                value={yearNumber}
                                onChange={(e) => setYearNumber(e.target.value)}
                                required
                            />
                        </FormControl>
                    </FormItem>
                    <FormItem>
                        <FormLabel>Filier</FormLabel>
                        <FormControl>
                            <select
                                value={filierId}
                                onChange={(e) => setFilierId(e.target.value)}
                                className="p-2 border rounded-md w-full"
                                required
                            >
                                <option value="">Select a Filier</option>
                                {filiers.map((filier) => (
                                    <option key={filier.id} value={filier.id}>{filier.name}</option>
                                ))}
                            </select>
                        </FormControl>
                    </FormItem>
                    <button
                        type="submit"
                        className="bg-green-600 text-white p-2 rounded-md mt-4 w-full hover:bg-gray-600"
                        disabled={isLoading}
                    >
                        {isLoading ? "Loading..." : editMode ? "Update Year" : "Add Year"}
                    </button>
                </form>
            )}
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                <tr className="bg-indigo-200">
                    <th className="border p-2">ID</th>
                    <th className="border p-2">Year Number</th>
                    <th className="border p-2">Filier</th>
                    <th className="border p-2">Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredYears.map((year) => (
                    <tr key={year.id} className="text-center">
                        <td className="border p-2">{year.id}</td>
                        <td className="border p-2">{year.year_number}</td>
                        <td className="border p-2">{year.filier ? year.filier.name : "-"}</td>
                        <td className="border p-2">
                            <button onClick={() => handleEdit(year)} className="text-blue-500 mr-2">
                                <i className="fa-sharp fa-solid fa-pencil" style={{color: "#4f46e5"}}></i>
                            </button>
                            <button onClick={() => handleDelete(year.id)} className="text-red-500">
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

export default Year;