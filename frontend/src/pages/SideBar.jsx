import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const sidebarItems = [
    {name: "Analytics", icon: "fas fa-chart-line"},
    {name: "Students", icon: "fas fa-users"},
    {name: "Teachers", icon: "fas fa-chalkboard-teacher"},
    {name: "Classrooms", icon: "fas fa-door-open"},
    {name: "Subjects", icon: "fas fa-book"},
    {name: "Filiers", icon: "fas fa-layer-group"},
    {name: "Years", icon: "fas fa-calendar"},
    {name: "Semesters", icon: "fa-solid fa-circle-half-stroke"},
    {name: "Timetables", icon: "fa-regular fa-calendar-days"},
];

const SideBar = () => {
    const isSidebarOpen = useSelector((state) => state.sidebar.isSidebarOpen);

    return (
        <div className="flex h-screen">
            <div
                className={`bg-gray-800 text-white p-4 fixed h-full transition-all duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}
            >
                <div className="flex items-center justify-center mb-6">
                    {isSidebarOpen ? (
                        <h2 className="text-xl font-bold">Admin Panel</h2>
                    ) : (
                        <i className="fas fa-cogs text-2xl"></i>
                    )}
                </div>

                <nav className="mt-4 flex-1 flex flex-col space-y-2">
                    {sidebarItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={`/${item.name.toLowerCase()}`}
                            className={({ isActive }) =>
                                `flex items-center py-3 px-4 rounded-md hover:bg-gray-700 transition ${isActive ? "bg-gray-700" : ""}`
                            }
                        >
                            <div className="flex justify-center w-8">
                                <i className={`${item.icon} text-lg`}></i>
                            </div>
                            {isSidebarOpen && <span className="ml-3">{item.name}</span>}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default SideBar;
