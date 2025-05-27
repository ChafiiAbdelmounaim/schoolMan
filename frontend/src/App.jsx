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
import PreviewTimetables from "./pages/timetables/PreviewTimetables.jsx";
import AnnouncementList from "./pages/announcement/AnnouncementList.jsx";
import AnnouncementDetail from "./pages/announcement/AnnouncementDetail.jsx";
import Announcement from "./pages/announcement/Announcement.jsx";
import EditTimetable from "./pages/timetables/EditTimetable.jsx";
import AnalyticsDashboard from "./pages/analytics/AnalyticsDashboard.jsx";




const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/",
                element: <GuestOnlyRoute><AdminLogin /></GuestOnlyRoute>,
            },
            // Admin routes
            {
                path: "/login",
                element: <LoggedInRoute><AdminLogin /></LoggedInRoute>,
            },
            {
                path: "/register",
                element: <ProtectedRoute><AdminRoute><RegisterAdmin /></AdminRoute></ProtectedRoute>,
            },
            {
                path : "/analytics",
                element : <ProtectedRoute><AdminRoute><AnalyticsDashboard /></AdminRoute></ProtectedRoute>
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
            {
                path : "/preview-timetables",
                element : <ProtectedRoute><AdminRoute><PreviewTimetables /></AdminRoute></ProtectedRoute>
            },
            {
                path: "/announcements/create",
                element: <ProtectedRoute><AdminRoute><Announcement /></AdminRoute></ProtectedRoute>
            },
            {
                path: "/announcements",
                element: <ProtectedRoute><AdminRoute><AnnouncementList /></AdminRoute></ProtectedRoute>
            },
            {
                path: "/announcements/:id",
                element: <ProtectedRoute><AdminRoute><AnnouncementDetail /></AdminRoute></ProtectedRoute>
            },
            {
                path: "/edit-timetable/:semesterId",
                element: <ProtectedRoute><AdminRoute><EditTimetable /></AdminRoute></ProtectedRoute>
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
            {
                path: "/teacher/announcements",
                element: <ProtectedRoute><TeacherRoute><AnnouncementList /></TeacherRoute></ProtectedRoute>
            },
            {
                path: "/teacher/announcements/:id",
                element: <ProtectedRoute><TeacherRoute><AnnouncementDetail /></TeacherRoute></ProtectedRoute>
            },

            // Student routes
            {
                path: "/student/dashboard",
                element: <ProtectedRoute><StudentRoute><StudentDashboard /></StudentRoute></ProtectedRoute>
            },
            {
                path: "/student/timetable",
                element: <ProtectedRoute><StudentRoute><StudentEmploi /></StudentRoute></ProtectedRoute>
            },
            {
                path: "/student/announcements",
                element: <ProtectedRoute><StudentRoute><AnnouncementList /></StudentRoute></ProtectedRoute>
            },
            {
                path: "/student/announcements/:id",
                element: <ProtectedRoute><StudentRoute><AnnouncementDetail /></StudentRoute></ProtectedRoute>
            },
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
