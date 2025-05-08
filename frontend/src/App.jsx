import {createBrowserRouter, RouterProvider} from "react-router";
import {Provider} from "react-redux";
import {store} from "./store/store.js";
import {ProtectedRoute} from "./components/ProtectedRoute.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import RegisterAdmin from "./pages/admin/RegisterAdmin.jsx";
import Subjects from "./pages/cruds/Subjects.jsx";
import Filier from "./pages/cruds/Filier.jsx";
import Year from "./pages/cruds/Year.jsx";
import Semesters from "./pages/cruds/Semesters.jsx";
import Students from "./pages/cruds/Students.jsx";
import Teachers from "./pages/cruds/Teachers.jsx";
import Classrooms from "./pages/cruds/Classrooms.jsx";
import Layout from "./pages/Layout.jsx";
import {LoggedInRoute} from "./components/LoggedInRoute.jsx";
import Timetable from "./pages/timetables/Timetable.jsx";
import Display from "./pages/timetables/Display.jsx";
import Emploi from "./pages/timetables/Emploi.jsx";
import ViewTeacher from "./pages/cruds/ViewTeacher.jsx";
import {AdminRoute} from "./pages/admin/AdminRoute .jsx";
import {TeacherRoute} from "./pages/teacher/TeacherRoute.jsx";
import TeacherDashboard from "./pages/teacher/TeacherDashboard.jsx";
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import {StudentRoute} from "./pages/student/StudentRoute.jsx";
import TeacherEmploi from "./pages/teacher/TeacherEmploi.jsx";
import StudentEmploi from "./pages/student/StudentEmploi.jsx";
import TeacherClasses from "./pages/teacher/TeacherClasses.jsx";
import HomePage from "./pages/guests/HomePage.jsx";
import {GuestOnlyRoute} from "./pages/guests/GuestOnlyRoute.jsx";



const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/",
                element: <GuestOnlyRoute><HomePage /></GuestOnlyRoute>,
            },
            // Admin routes
            {
                path: "/login",
                element: <LoggedInRoute><AdminLogin /></LoggedInRoute>,
            },
            {
                path: "/register",
                element: <LoggedInRoute><RegisterAdmin /></LoggedInRoute>,
            },
            {
                path : "/subjects",
                element : <ProtectedRoute><AdminRoute><Subjects /></AdminRoute></ProtectedRoute>
            },
            {
                path : "/filiers",
                element : <ProtectedRoute><AdminRoute><Filier /></AdminRoute></ProtectedRoute>
            },
            {
                path : "/years",
                element : <ProtectedRoute><AdminRoute><Year /></AdminRoute></ProtectedRoute>
            },
            {
                path : "/semesters",
                element : <ProtectedRoute><AdminRoute><Semesters /></AdminRoute></ProtectedRoute>
            },
            {
                path : "/students",
                element : <ProtectedRoute><AdminRoute><Students /></AdminRoute></ProtectedRoute>
            },
            {
                path : "/teachers",
                element : <ProtectedRoute><AdminRoute><Teachers /></AdminRoute></ProtectedRoute>
            },
            {
                path : "/teachers/:id",
                element : <ProtectedRoute><AdminRoute><ViewTeacher /></AdminRoute></ProtectedRoute>
            },
            {
                path : "/classrooms",
                element : <ProtectedRoute><AdminRoute><Classrooms /></AdminRoute></ProtectedRoute>
            },
            {
                path : "/timetables",
                element : <ProtectedRoute><AdminRoute><Timetable /></AdminRoute></ProtectedRoute>
            },
            {
                path : "/display",
                element : <ProtectedRoute><AdminRoute><Display /></AdminRoute></ProtectedRoute>
            },
            {
                path : "/emploi",
                element : <ProtectedRoute><AdminRoute><Emploi /></AdminRoute></ProtectedRoute>
            },

            // Teacher routes
            {
                path: "/teacher/dashboard",
                element: <ProtectedRoute><TeacherRoute><TeacherDashboard /></TeacherRoute></ProtectedRoute>
            },
            {
                path: "/teacher/timetable",
                element: <ProtectedRoute><TeacherRoute><TeacherEmploi /></TeacherRoute></ProtectedRoute>
            },
            {
                path: "/teacher/classes",
                element: <ProtectedRoute><TeacherRoute><TeacherClasses /></TeacherRoute></ProtectedRoute>
            },
            // Student routes
            {
                path: "/student/dashboard",
                element: <ProtectedRoute><StudentRoute><StudentDashboard /></StudentRoute></ProtectedRoute>
            },
            {
                path: "/student/timetable",
                element: <ProtectedRoute><StudentRoute><StudentEmploi /></StudentRoute></ProtectedRoute>
            }
        ]
    }
]);

function App() {

  return (
    <Provider store={store}>
      <RouterProvider router={router} ></RouterProvider>
    </Provider>
  )
}

export default App
