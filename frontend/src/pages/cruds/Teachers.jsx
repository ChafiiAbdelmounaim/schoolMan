import { useState, useEffect } from "react";
import axios from "axios";
import FormItem from "../../components/form/FormItem.jsx";
import Input from "../../components/form/Input.jsx";
import FormMessage from "../../components/form/FormMessage.jsx";
import FormControl from "../../components/form/FormControl.jsx";
import FormLabel from "../../components/form/FormLabel.jsx";

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [dateNaissance, setDateNaissance] = useState("");
    const [dateEmbauche, setDateEmbauche] = useState("");
    const [salary, setSalary] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formVisible, setFormVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredTeachers, setFilteredTeachers] = useState([]);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8000/api/teachers", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTeachers(response.data);
            setFilteredTeachers(response.data); // Initialize filtered list
        } catch (error) {
            console.error("Error fetching teachers:", error);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        const filtered = teachers.filter(teacher =>
            teacher.full_name.toLowerCase().includes(query)
        );

        setFilteredTeachers(filtered);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const data = { full_name: fullName, email, password, dateNaissance, dateEmbauche, salary };
            if (editMode) {
                await axios.put(`http://localhost:8000/api/teachers/${editId}`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage("Teacher updated successfully!");
            } else {
                await axios.post("http://localhost:8000/api/teachers", data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage("Teacher added successfully!");
            }
            setFullName("");
            setEmail("");
            setPassword("");
            setDateNaissance("");
            setDateEmbauche("");
            setSalary("");
            setEditMode(false);
            setEditId(null);
            setFormVisible(false);
            fetchTeachers();
        } catch (error) {
            setMessage("Error saving teacher.");
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleEdit = (teacher) => {
        setFullName(teacher.full_name);
        setEmail(teacher.email);
        setPassword(""); // Keep password empty for security reasons
        setDateNaissance(teacher.dateNaissance ? new Date(teacher.dateNaissance).toISOString().split('T')[0] : "");
        setDateEmbauche(teacher.dateEmbauche ? new Date(teacher.dateEmbauche).toISOString().split('T')[0] : "");
        setSalary(teacher.salary);
        setEditMode(true);
        setEditId(teacher.id);
        setFormVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8000/api/teachers/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTeachers();
        } catch (error) {
            console.error("Error deleting teacher:", error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto mt-16 p-6 border rounded-md shadow-md overflow-x-auto custom-scrollbar">
            <h2 className="text-2xl font-bold text-center mb-8">Teachers</h2>
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => {
                        if (editMode) {
                            setEditMode(false);
                            setEditId(null);
                            setFullName("");
                            setEmail("");
                            setPassword("");
                            setDateNaissance("");
                            setDateEmbauche("");
                            setSalary("");
                        }
                        setFormVisible(!formVisible);
                    }
                }
                    className="mb-4 bg-green-600 text-white px-4 py-2 rounded"
                >
                    {editMode ? "Cancel Edit" : formVisible ? "Hide Form" : "Create Teacher"}
                </button>
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="p-2 border rounded-md"
                />

            </div>
            {formVisible && (
                <form onSubmit={handleSubmit} className="mb-6">
                    <FormMessage message={message} />
                    <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                            <Input
                                type="text"
                                placeholder="Enter full name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </FormControl>
                    </FormItem>
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input
                                type="email"
                                placeholder="Enter email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </FormControl>
                    </FormItem>
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <Input
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </FormControl>
                    </FormItem>
                    <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                            <Input
                                type="date"
                                value={dateNaissance}
                                onChange={(e) => setDateNaissance(e.target.value)}
                                required
                            />
                        </FormControl>
                    </FormItem>
                    <FormItem>
                        <FormLabel>Hiring Date</FormLabel>
                        <FormControl>
                            <Input
                                type="date"
                                value={dateEmbauche}
                                onChange={(e) => setDateEmbauche(e.target.value)}
                                required
                            />
                        </FormControl>
                    </FormItem>
                    <FormItem>
                        <FormLabel>Salary</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                placeholder="Enter salary"
                                value={salary}
                                onChange={(e) => setSalary(e.target.value)}
                                required
                            />
                        </FormControl>
                    </FormItem>

                    <button
                        type="submit"
                        className="bg-green-600 text-white p-2 rounded-md mt-4 w-full hover:bg-gray-600"
                        disabled={isLoading}
                    >
                        {isLoading ? "Loading..." : editMode ? "Update Teacher" : "Add Teacher"}
                    </button>
                </form>
            )}
            <table className="w-full border-collapse border border-gray-300 min-w-max">
                <thead>
                <tr className="bg-indigo-200">
                    <th className="border p-2">ID</th>
                    <th className="border p-2">Full Name</th>
                    <th className="border p-2">Email</th>
                    <th className="border p-2">Date of Birth</th>
                    <th className="border p-2">Hiring Date</th>
                    <th className="border p-2">Salary</th>
                    <th className="border p-2">Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="text-center">
                        <td className="border p-2">{teacher.id}</td>
                        <td className="border p-2">{teacher.full_name}</td>
                        <td className="border p-2">{teacher.email}</td>
                        <td className="border p-2">{teacher.dateNaissance ? teacher.dateNaissance.split('T')[0] : ''}</td>
                        <td className="border p-2">{teacher.dateEmbauche ? teacher.dateEmbauche.split('T')[0] : ''}</td>
                        <td className="border p-2">{teacher.salary}</td>
                        <td className="border p-2">
                            <button onClick={() => handleEdit(teacher)} className="text-blue-500 mr-2">
                                <i className="fa-sharp fa-solid fa-pencil" style={{color: "#4f46e5"}}></i>
                            </button>
                            <button onClick={() => handleDelete(teacher.id)} className="text-red-500">
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

export default Teachers;
