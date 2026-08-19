import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Signup from "./pages/Signup";

// Student Pages
import StudentDashboard from "./pages/StudentDashboard";
import MyCourses from "./pages/MyCourses";
import ExploreCourses from "./pages/ExploreCourses";
import CourseDetails from "./pages/CourseDetails";
import StudentNotes from "./pages/StudentNotes";
import StudentQuizzes from "./pages/StudentQuizzes";
import StudentQuizTake from "./pages/StudentQuizTake";
import StudentAssignments from "./pages/StudentAssignments";
import StudentProgress from "./pages/StudentProgress";

// Teacher Pages
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherCourses from "./pages/TeacherCourses";
import TeacherStudents from "./pages/TeacherStudents";
import TeacherNotes from "./pages/TeacherNotes";
import TeacherQuizzes from "./pages/TeacherQuizzes";
import TeacherAssignments from "./pages/TeacherAssignments";
import TeacherSubmissions from "./pages/TeacherSubmissions";

// Admin / HOD Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminTeachers from "./pages/AdminTeachers";
import AdminStudents from "./pages/AdminStudents";
import AdminCourses from "./pages/AdminCourses";
import AdminQuizzes from "./pages/AdminQuizzes";
import AdminAssignments from "./pages/AdminAssignments";
import AdminResults from "./pages/AdminResults";
import AdminActivity from "./pages/AdminActivity";

import "./App.css";

// Fallback Redirect Helper
const FallbackRedirect = () => {
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Default root path goes to /login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/signup" element={<Signup />} />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/my-courses"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <MyCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/courses"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <ExploreCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/courses/:courseId"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <CourseDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/notes"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentNotes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/quizzes"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentQuizzes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/quizzes/:quizId"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentQuizTake />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/assignments"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentAssignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/progress"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentProgress />
              </ProtectedRoute>
            }
          />

          {/* Teacher Routes */}
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute allowedRoles={["teacher", "faculty"]}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/courses"
            element={
              <ProtectedRoute allowedRoles={["teacher", "faculty"]}>
                <TeacherCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/students"
            element={
              <ProtectedRoute allowedRoles={["teacher", "faculty"]}>
                <TeacherStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/notes"
            element={
              <ProtectedRoute allowedRoles={["teacher", "faculty"]}>
                <TeacherNotes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/quizzes"
            element={
              <ProtectedRoute allowedRoles={["teacher", "faculty"]}>
                <TeacherQuizzes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/assignments"
            element={
              <ProtectedRoute allowedRoles={["teacher", "faculty"]}>
                <TeacherAssignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/submissions"
            element={
              <ProtectedRoute allowedRoles={["teacher", "faculty"]}>
                <TeacherSubmissions />
              </ProtectedRoute>
            }
          />

          {/* Admin / HOD Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teachers"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminTeachers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/quizzes"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminQuizzes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assignments"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminAssignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/results"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminResults />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/activity"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminActivity />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<FallbackRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
