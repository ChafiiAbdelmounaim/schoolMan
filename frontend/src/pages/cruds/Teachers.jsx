import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import FormItem from "../../components/form/FormItem.jsx";
import Input from "../../components/form/Input.jsx";
import FormControl from "../../components/form/FormControl.jsx";
import FormLabel from "../../components/form/FormLabel.jsx";
import {Select} from "@headlessui/react";

const Teachers = () => {
    // State declarations
    const [teachers, setTeachers] = useState([]);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [dateNaissance, setDateNaissance] = useState("");
    const [dateEmbauche, setDateEmbauche] = useState("");
    const [grade, setGrade] = useState("PA");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formVisible, setFormVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [importFile, setImportFile] = useState(null);
    const [importProgress, setImportProgress] = useState(null);

    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const filteredTeachers = teachers.filter(teacher =>
        teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.grade.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Fetch data on component mount
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
        } catch (error) {
            console.error("Error fetching teachers:", error);
            setMessage("Error fetching teachers");
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (editMode) {
                await axios.put(`http://localhost:8000/api/teachers/${editId}`, {
                    full_name: fullName,
                    email,
                    password,
                    dateNaissance,
                    dateEmbauche,
                    grade
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage("Teacher updated successfully!");
            } else {
                await axios.post("http://localhost:8000/api/teachers", {
                    full_name: fullName,
                    email,
                    password,
                    dateNaissance,
                    dateEmbauche,
                    grade
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage("Teacher added successfully!");
            }
            resetForm();
            fetchTeachers();
        } catch (error) {
            console.error("Error:", error);
            setMessage(error.response?.data?.message || "Error saving teacher");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFullName("");
        setEmail("");
        setPassword("");
        setDateNaissance("");
        setDateEmbauche("");
        setGrade("PA");
        setEditMode(false);
        setEditId(null);
        setFormVisible(false);
    };

    const handleEdit = (teacher) => {
        setFullName(teacher.full_name);
        setEmail(teacher.email);
        setPassword("");
        setDateNaissance(teacher.dateNaissance ? teacher.dateNaissance.split('T')[0] : "");
        setDateEmbauche(teacher.dateEmbauche ? teacher.dateEmbauche.split('T')[0] : "");
        setGrade(teacher.grade);
        setEditMode(true);
        setEditId(teacher.id);
        setFormVisible(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this teacher?")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8000/api/teachers/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage("Teacher deleted successfully");
            fetchTeachers();
        } catch (error) {
            console.error("Error deleting teacher:", error);
            setMessage("Error deleting teacher");
        }
    };

    const handleFileChange = (e) => {
        setImportFile(e.target.files[0]);
        setMessage("");
    };

    const handleImport = async () => {
        if (!importFile) {
            setMessage("Please select a file first");
            return;
        }

        setIsLoading(true);
        setImportProgress("Reading file...");

        try {
            const data = await readExcelFile(importFile);
            setImportProgress(`Found ${data.length} teachers to import...`);

            const token = localStorage.getItem("token");
            const response = await axios.post(
                "http://localhost:8000/api/teachers/import",
                { teachers: data },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setMessage(`Successfully imported ${response.data.imported_count} teachers`);
                if (response.data.error_count > 0) {
                    setMessage(prev => `${prev} (${response.data.error_count} failed)`);
                }
            } else {
                setMessage("Import failed: " + (response.data.message || "Unknown error"));
            }

            setImportFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            fetchTeachers();
        } catch (error) {
            console.error("Import error:", error);
            setMessage("Error importing teachers: " +
                (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
            setImportProgress(null);
        }
    };

    const readExcelFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                    const mappedData = jsonData.map(row => {
                        // Handle date formatting
                        let dateNaissance = row['Date of Birth'] || row['dateNaissance'] || '';
                        let dateEmbauche = row['Hiring Date'] || row['dateEmbauche'] || '';

                        // Convert Excel date serial numbers to JS Date if needed
                        const convertDate = (excelDate) => {
                            if (typeof excelDate === 'number') {
                                const excelEpoch = new Date(1899, 11, 30);
                                const jsDate = new Date(excelEpoch.getTime() + excelDate * 24 * 60 * 60 * 1000);
                                return jsDate.toISOString().split('T')[0];
                            }
                            return excelDate;
                        };

                        dateNaissance = convertDate(dateNaissance);
                        dateEmbauche = convertDate(dateEmbauche);

                        return {
                            full_name: row['Full Name'] || row['full_name'] || '',
                            email: row['Email'] || row['email'] || '',
                            password: row['Password'] || row['password'] || 'defaultPassword123',
                            dateNaissance: dateNaissance,
                            dateEmbauche: dateEmbauche,
                            grade: ['PA', 'PH', 'PES'].includes(row['Grade']) ? row['Grade'] : 'PA'
                        };
                    });

                    resolve(mappedData.filter(item => item.full_name && item.email));
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    };

    return (
        <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Teachers Management</h1>

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
                                <i className="fas fa-plus"></i> Create Teacher
                            </>
                        )}
                    </button>

                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".xlsx, .xls, .csv"
                            className="hidden"
                            id="file-import"
                        />
                        <label
                            htmlFor="file-import"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer transition flex items-center gap-2"
                        >
                            <i className="fas fa-file-import"></i> Import Excel
                        </label>
                        {importFile && (
                            <button
                                onClick={handleImport}
                                disabled={isLoading}
                                className={`bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition flex items-center gap-2 ${isLoading ? 'opacity-50' : ''}`}
                            >
                                {isLoading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> Importing...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-upload"></i> Import ({importFile.name})
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <div className="relative w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search teachers..."
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
            {importProgress && (
                <div className="mb-6 p-4 bg-blue-100 text-blue-800 rounded flex items-center gap-2">
                    <i className="fas fa-info-circle"></i>
                    <span>{importProgress}</span>
                </div>
            )}

            {/* Teacher Form */}
            {formVisible && (
                <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg shadow-inner">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">
                        {editMode ? "Edit Teacher" : "Add New Teacher"}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    placeholder="Teacher full name"
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
                                    placeholder="Teacher email"
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
                                    placeholder={editMode ? "Leave blank to keep current" : "Teacher password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required={!editMode}
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
                            <FormLabel>Grade</FormLabel>
                            <FormControl>
                                <select
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="PA">PA</option>
                                    <option value="PH">PH</option>
                                    <option value="PES">PES</option>
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
                                "Update Teacher"
                            ) : (
                                "Add Teacher"
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* Teachers Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-800">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Full Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date of Birth</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Hiring Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Grade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTeachers.length > 0 ? (
                        filteredTeachers.map((teacher) => (
                            <tr key={teacher.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {teacher.full_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {teacher.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {teacher.dateNaissance ? new Date(teacher.dateNaissance).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {teacher.dateEmbauche ? new Date(teacher.dateEmbauche).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {teacher.grade}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(teacher)}
                                            className="text-blue-600 hover:text-blue-900"
                                            title="Edit"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            onClick={() => window.open(`/teachers/${teacher.id}`, '_blank')}
                                            className="text-green-600 hover:text-green-900"
                                            title="View"
                                        >
                                            <i className="fas fa-eye"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(teacher.id)}
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
                            <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                {teachers.length === 0 ? "No teachers found in database" : "No teachers match your search"}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Teachers;