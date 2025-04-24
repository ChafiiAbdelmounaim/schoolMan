import {createBrowserRouter, RouterProvider} from "react-router";
import {Provider} from "react-redux";
import {store} from "./store/store.js";
import {ProtectedRoute} from "./components/ProtectedRoute.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import RegisterAdmin from "./pages/admin/RegisterAdmin.jsx";
import IndexAdmin from "./pages/admin/IndexAdmin.jsx";
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



const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/login",
                element: <LoggedInRoute><AdminLogin /></LoggedInRoute>,
            },
            {
                path: "/register",
                element: <LoggedInRoute><RegisterAdmin /></LoggedInRoute>,
            },
            {
                path: "/admin",
                element: <ProtectedRoute><IndexAdmin /></ProtectedRoute>
            },
            {
                path : "/subjects",
                element : <ProtectedRoute><Subjects /></ProtectedRoute>
            },
            {
                path : "/filiers",
                element : <ProtectedRoute><Filier /></ProtectedRoute>
            },
            {
                path : "/years",
                element : <ProtectedRoute><Year /></ProtectedRoute>
            },
            {
                path : "/semesters",
                element : <ProtectedRoute><Semesters /></ProtectedRoute>
            },
            {
                path : "/students",
                element : <ProtectedRoute><Students /></ProtectedRoute>
            },
            {
                path : "/teachers",
                element : <ProtectedRoute><Teachers /></ProtectedRoute>
            },
            {
                path : "/teachers/:id",
                element : <ProtectedRoute><ViewTeacher /></ProtectedRoute>
            },
            {
                path : "/classrooms",
                element : <ProtectedRoute><Classrooms /></ProtectedRoute>
            },
            {
                path : "/timetables",
                element : <ProtectedRoute><Timetable /></ProtectedRoute>
            },
            {
                path : "/display",
                element : <ProtectedRoute><Display /></ProtectedRoute>
            },
            {
                path : "/emploi",
                element : <ProtectedRoute><Emploi /></ProtectedRoute>
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
