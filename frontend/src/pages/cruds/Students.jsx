import { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import FormItem from "../../components/form/FormItem.jsx";
import Input from "../../components/form/Input.jsx";
import FormMessage from "../../components/form/FormMessage.jsx";
import FormControl from "../../components/form/FormControl.jsx";
import FormLabel from "../../components/form/FormLabel.jsx";

const Students = () => {
    // State declarations
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
    const [importFile, setImportFile] = useState(null);
    const [importProgress, setImportProgress] = useState(null);

    const fileInputRef = useRef(null);
    const filteredYears = allYears.filter(year => year.filier_id == filierId);

    const filteredStudents = students.filter(student =>
        student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.apogee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.year?.filier?.name && student.year.filier.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Fetch data on component mount
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
            setMessage("Error fetching students");
        }
    };

    const fetchYears = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8000/api/years", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllYears(response.data);
        } catch (error) {
            console.error("Error fetching years:", error);
            setMessage("Error fetching years");
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
            setMessage("Error fetching filiers");
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (editMode) {
                await axios.put(`http://localhost:8000/api/students/${editId}`, {
                    full_name: fullName,
                    email,
                    password,
                    dateNaisance,
                    apogee,
                    year_id: yearId,
                    filier_id: filierId
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage("Student updated successfully!");
            } else {
                await axios.post("http://localhost:8000/api/students", {
                    full_name: fullName,
                    email,
                    password,
                    dateNaisance,
                    apogee,
                    year_id: yearId,
                    filier_id: filierId
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage("Student added successfully!");
            }
            resetForm();
            fetchStudents();
        } catch (error) {
            console.error("Error:", error);
            setMessage(error.response?.data?.message || "Error saving student");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
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
    };

    const handleEdit = (student) => {
        setFullName(student.full_name);
        setEmail(student.email);
        setPassword("");
        setDateNaisance(student.dateNaisance ? student.dateNaisance.split('T')[0] : "");
        setApogee(student.apogee);
        setYearId(student.year_id || "");
        setFilierId(student.filier_id || "");
        setEditMode(true);
        setEditId(student.id);
        setFormVisible(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this student?")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8000/api/students/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage("Student deleted successfully");
            fetchStudents();
        } catch (error) {
            console.error("Error deleting student:", error);
            setMessage("Error deleting student");
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
            setImportProgress(`Found ${data.length} students to import...`);

            const token = localStorage.getItem("token");
            const response = await axios.post(
                "http://localhost:8000/api/students/import",
                { students: data },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setMessage(`Successfully imported ${response.data.imported_count} students`);
                if (response.data.error_count > 0) {
                    setMessage(prev => `${prev} (${response.data.error_count} failed)`);
                }
            } else {
                setMessage("Import failed: " + (response.data.message || "Unknown error"));
            }

            setImportFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            fetchStudents();
        } catch (error) {
            console.error("Import error:", error);
            setMessage("Error importing students: " +
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
                        let dateNaisance = row['Date of Birth'] || row['dateNaisance'] || '';

                        // Convert Excel date serial number to JS Date if needed
                        if (typeof dateNaisance === 'number') {
                            const excelEpoch = new Date(1899, 11, 30);
                            const jsDate = new Date(excelEpoch.getTime() + dateNaisance * 24 * 60 * 60 * 1000);
                            dateNaisance = jsDate.toISOString().split('T')[0];
                        }
                        // Convert other date formats to YYYY-MM-DD
                        else if (dateNaisance instanceof Date) {
                            dateNaisance = dateNaisance.toISOString().split('T')[0];
                        }
                        // Handle string dates
                        else if (typeof dateNaisance === 'string') {
                            // Try to parse various date formats
                            const parsedDate = new Date(dateNaisance);
                            if (!isNaN(parsedDate.getTime())) {
                                dateNaisance = parsedDate.toISOString().split('T')[0];
                            }
                        }

                        return {
                            full_name: row['Full Name'] || row['full_name'] || '',
                            email: row['Email'] || row['email'] || '',
                            password: row['Password'] || row['password'] || 'defaultPassword123',
                            dateNaisance: dateNaisance,
                            apogee: row['Apogee'] || row['apogee'] || '',
                            year_id: row['Year ID'] || row['year_id'] || '',
                            filier_id: row['Filier ID'] || row['filier_id'] || ''
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
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Students Management</h1>

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
                                <i className="fas fa-plus"></i> Create Student
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
                        placeholder="Search students..."
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

            {/* Student Form */}
            {formVisible && (
                <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg shadow-inner">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">
                        {editMode ? "Edit Student" : "Add New Student"}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    placeholder="Student full name"
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
                                    placeholder="Student email"
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
                                    placeholder={editMode ? "Leave blank to keep current" : "Student password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required={!editMode}
                                />
                            </FormControl>
                        </FormItem>

                        <FormItem>
                            <FormLabel>Apogee Number</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    placeholder="Student apogee"
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
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Select Filier</option>
                                    {filiers.map((filier) => (
                                        <option key={filier.id} value={filier.id}>
                                            {filier.name}
                                        </option>
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
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    disabled={!filierId}
                                >
                                    <option value="">{filierId ? "Select Year" : "Select Filier first"}</option>
                                    {filteredYears.map((year) => (
                                        <option key={year.id} value={year.id}>
                                            Year {year.year_number}
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
                                "Update Student"
                            ) : (
                                "Add Student"
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* Students Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-800">
                    <tr>
                        {/*<th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">ID</th>*/}
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Full Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Apogee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date of Birth</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Program</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50">
                                {/*<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.id}</td>*/}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {student.full_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {student.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {student.apogee}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {student.dateNaisance ? new Date(student.dateNaisance).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {student.year ? (
                                        <div>
                                            <div className="font-medium">{student.year.filier?.name || 'N/A'}</div>
                                            <div className="text-xs text-gray-400">Year {student.year.year_number}</div>
                                        </div>
                                    ) : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(student)}
                                            className="text-blue-600 hover:text-blue-900"
                                            title="Edit"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(student.id)}
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
                                {students.length === 0 ? "No students found in database" : "No students match your search"}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Students;