import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const AnalyticsDashboard = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState("");

    // Colors for charts
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'];

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8000/api/analytics", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalyticsData(response.data.data);
        } catch (error) {
            console.error("Error fetching analytics:", error);
            setMessage("Error fetching analytics data");
        } finally {
            setIsLoading(false);
        }
    };

    const StatCard = ({ title, value, icon, bgColor = "bg-blue-100", textColor = "text-blue-600", borderColor = "border-blue-500" }) => (
        <div className={`${bgColor} rounded-lg shadow-md p-6 border-l-4 ${borderColor}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 text-sm font-medium">{title}</p>
                    <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
                </div>
                <div className={`${textColor} text-2xl`}>{icon}</div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
                <div className="text-center py-12">
                    <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
                    <p className="text-gray-600">Loading analytics...</p>
                </div>
            </div>
        );
    }

    const { general_stats, detailed_stats, growth_stats } = analyticsData || {};

    return (
        <div className="max-w-7xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-center text-gray-800">School Analytics Dashboard</h1>
                <p className="text-gray-600 text-center mt-2">Overview of your school's key metrics and statistics</p>
            </div>

            {/* Status Messages */}
            {message && (
                <div className="mb-6 p-4 rounded bg-red-100 text-red-800">
                    <div className="flex items-center gap-2">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{message}</span>
                    </div>
                </div>
            )}

            {/* General Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Students"
                    value={general_stats?.total_students || 0}
                    icon="👨‍🎓"
                    bgColor="bg-blue-50"
                    textColor="text-blue-600"
                    borderColor="border-blue-500"
                />
                <StatCard
                    title="Total Teachers"
                    value={general_stats?.total_teachers || 0}
                    icon="👩‍🏫"
                    bgColor="bg-green-50"
                    textColor="text-green-600"
                    borderColor="border-green-500"
                />
                <StatCard
                    title="Filiers"
                    value={general_stats?.total_filiers || 0}
                    icon="📚"
                    bgColor="bg-purple-50"
                    textColor="text-purple-600"
                    borderColor="border-purple-500"
                />
                <StatCard
                    title="Subjects"
                    value={general_stats?.total_subjects || 0}
                    icon="📖"
                    bgColor="bg-orange-50"
                    textColor="text-orange-600"
                    borderColor="border-orange-500"
                />
                <StatCard
                    title="Classrooms"
                    value={general_stats?.total_classrooms || 0}
                    icon="🏫"
                    bgColor="bg-indigo-50"
                    textColor="text-indigo-600"
                    borderColor="border-indigo-500"
                />
                <StatCard
                    title="Total Admins"
                    value={general_stats?.total_users || 0}
                    icon="👥"
                    bgColor="bg-pink-50"
                    textColor="text-pink-600"
                    borderColor="border-pink-500"
                />
                <StatCard
                    title="Timetables"
                    value={general_stats?.total_timetables || 0}
                    icon="📅"
                    bgColor="bg-yellow-50"
                    textColor="text-yellow-600"
                    borderColor="border-yellow-500"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Students per Filier Chart */}
                <div className="bg-gray-50 rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <i className="fas fa-chart-bar text-blue-500"></i>
                        Students per Filier
                    </h3>
                    {detailed_stats?.students_per_filier?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={detailed_stats.students_per_filier}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <i className="fas fa-chart-bar text-4xl mb-2"></i>
                                <p>No data available</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Student Distribution by Academic Level Pie Chart */}
                <div className="bg-gray-50 rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <i className="fas fa-chart-pie text-green-500"></i>
                        Student Distribution by Academic Level
                    </h3>
                    {detailed_stats?.students_by_academic_level?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={detailed_stats.students_by_academic_level}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {detailed_stats.students_by_academic_level.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <i className="fas fa-chart-pie text-4xl mb-2"></i>
                                <p>No data available</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Growth Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Monthly Student Registrations */}
                <div className="bg-gray-50 rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <i className="fas fa-chart-line text-purple-500"></i>
                        Monthly Student Registrations
                    </h3>
                    {growth_stats?.monthly_student_registrations?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={growth_stats.monthly_student_registrations}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <i className="fas fa-chart-line text-4xl mb-2"></i>
                                <p>No data available</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Subjects per Filier */}
                <div className="bg-gray-50 rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <i className="fas fa-chart-bar text-orange-500"></i>
                        Subjects per Filier
                    </h3>
                    {detailed_stats?.subjects_per_filier?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={detailed_stats.subjects_per_filier}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <i className="fas fa-chart-bar text-4xl mb-2"></i>
                                <p>No data available</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Monthly Teacher Registrations - Full Width */}
            <div className="bg-gray-50 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-chart-line text-red-500"></i>
                    Monthly Teacher Registrations
                </h3>
                {growth_stats?.monthly_teacher_registrations?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={growth_stats.monthly_teacher_registrations}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#ff7300" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <i className="fas fa-chart-line text-4xl mb-2"></i>
                            <p>No data available</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsDashboard;