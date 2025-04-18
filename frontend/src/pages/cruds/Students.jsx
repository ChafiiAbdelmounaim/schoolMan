import { useState, useEffect } from "react";
import axios from "axios";
import FormItem from "../../components/form/FormItem.jsx";
import Input from "../../components/form/Input.jsx";
import FormMessage from "../../components/form/FormMessage.jsx";
import FormControl from "../../components/form/FormControl.jsx";
import FormLabel from "../../components/form/FormLabel.jsx";

const Students = () => {
    const [students, setStudents] = useState([]);
    const [years, setYears] = useState([]);
    const [filiers, setFiliers] = useState([]);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [dateNaisance, setDateNaisance] = useState("");
    const [apogee, setApogee] = useState("");
    const [yearId, setYearId] = useState("");
    const [filierId, setFilierId] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formVisible, setFormVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [allYears, setAllYears] = useState([]);
    const filteredYears = allYears.filter(year => year.filier_id == filierId);

    useEffect(() => {
        fetchStudents();
        fetchYears();
        fetchFiliers();
    }, []);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8000/api/students", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(response.data);
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    const fetchYears = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8000/api/years", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllYears(response.data); // Store all years
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
                await axios.put(`http://localhost:8000/api/students/${editId}`, { full_name: fullName, email, password, dateNaisance, apogee, year_id: yearId, filier_id: filierId }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage("Student updated successfully!");
            } else {
                await axios.post("http://localhost:8000/api/students", { full_name: fullName, email, password, dateNaisance, apogee, year_id: yearId, filier_id: filierId }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage("Student added successfully!");
            }
            setFullName("");
            setEmail("");
            setPassword("");
            setDateNaisance("");
            setApogee("");
            setYearId("");
            setFilierId("");
            setEditMode(false);
            setEditId(null);
            setFormVisible(false);
            fetchStudents();
        } catch (error) {
            setMessage("Error saving student.");
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (student) => {
        setFullName(student.full_name);
        setEmail(student.email);
        setPassword(""); // Keep password empty for security reasons
        setDateNaisance(student.dateNaisance ? new Date(student.dateNaisance).toISOString().split('T')[0] : "");
        setApogee(student.apogee);
        setYearId(student.year_id || "");
        setFilierId(student.filier_id || "");
        setEditMode(true);
        setEditId(student.id);
        setFormVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8000/api/students/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchStudents();
        } catch (error) {
            console.error("Error deleting student:", error);
        }
    };

    const filteredStudents = students.filter(student =>
        student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.year?.filier?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );



    return (
        <div className="max-w-4xl mx-auto mt-16 p-6 border rounded-md shadow-md">
            <h2 className="text-2xl font-bold text-center mb-8">Students</h2>
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => setFormVisible(!formVisible)}
                    className="mb-4 bg-green-600 text-white px-4 py-2 rounded"
                >
                    {formVisible ? "Hide Form" : "Create Student"}
                </button>
                <input
                    type="text"
                    placeholder="Search by name or filier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                                required
                            />
                        </FormControl>
                    </FormItem>
                    <FormItem>
                        <FormLabel>Apogee</FormLabel>
                        <FormControl>
                            <Input
                                type="text"
                                placeholder="Enter apogee number"
                                value={apogee}
                                onChange={(e) => setApogee(e.target.value)}
                                required
                            />
                        </FormControl>
                    </FormItem>
                    <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                            <Input
                                type="date"
                                value={dateNaisance}
                                onChange={(e) => setDateNaisance(e.target.value)}
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
                                {filteredYears.map((year) => (
                                    <option key={year.id} value={year.id}>{year.year_number}</option>
                                ))}
                            </select>
                        </FormControl>
                    </FormItem>

                    <button
                        type="submit"
                        className="bg-green-600 text-white p-2 rounded-md mt-4 w-full hover:bg-gray-600"
                        disabled={isLoading}
                    >
                        {isLoading ? "Loading..." : editMode ? "Update Student" : "Add Student"}
                    </button>
                </form>
            )}

            <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 min-w-max">
                    <thead>
                    <tr className="bg-indigo-200">
                        <th className="border p-2">ID</th>
                        <th className="border p-2">Full Name</th>
                        <th className="border p-2">Email</th>
                        <th className="border p-2">Apogee</th>
                        <th className="border p-2">Date of Birth</th>
                        <th className="border p-2">Filier & Year</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredStudents.map((student) => (
                        <tr key={student.id} className="text-center">
                            <td className="border p-2">{student.id}</td>
                            <td className="border p-2 truncate max-w-xs overflow-hidden text-ellipsis">{student.full_name}</td>
                            <td className="border p-2 truncate max-w-xs overflow-hidden text-ellipsis">{student.email}</td>
                            <td className="border p-2 truncate max-w-xs overflow-hidden text-ellipsis">{student.apogee}</td>
                            <td className="border p-2 truncate max-w-xs overflow-hidden text-ellipsis">{student.dateNaisance ? student.dateNaisance.split('T')[0] : ''}</td>
                            <td className="border p-2 truncate max-w-xs overflow-hidden text-ellipsis">{student.year ? `${student.year.filier.name} ${student.year.year_number}` : "-"}</td>
                            <td className="border p-2">
                                <button onClick={() => handleEdit(student)} className="text-blue-500 mr-2">
                                    <i className="fa-sharp fa-solid fa-pencil" style={{color: "#4f46e5"}}></i>
                                </button>
                                <button onClick={() => handleDelete(student.id)} className="text-red-500">
                                    <i className="fa-sharp fa-solid fa-trash" style={{color: "#4f46e5"}}></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default Students;
