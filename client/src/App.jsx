import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import ProjectHistory from "./pages/ProjectHistory";
import ManageProjects from "./pages/ManageProjects";
import ProjectView from "./pages/ProjectView";
import TeachersPage from "./pages/TeachersPage";
import StudentsPage from "./pages/StudentsPage";
import Login from "./pages/Login";
import { Menu } from "lucide-react";

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        JSON.parse(storedUser);
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const ProtectedRoute = ({ children }) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return <Navigate to="/login" replace />;
    return children;
  };

  const AppLayout = ({ mobileMenuOpen, setMobileMenuOpen }) => (
    <div className="flex min-h-screen bg-background text-white">
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed top-6 left-6 z-[60] p-3 bg-white/5 border border-white/10 rounded-xl"
      >
        <Menu size={24} />
      </button>

      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <main className="flex-1 lg:pl-[280px] h-screen transition-all overflow-y-auto bg-background/50">
        <div className="p-4 sm:p-6 lg:p-8 w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );

  const router = createBrowserRouter(
    [
      { path: "/login", element: <Login /> },
      { path: "/project/:id", element: <ProjectView /> },
      {
        path: "/*",
        element: (
          <ProtectedRoute>
            <AppLayout
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
            />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Dashboard /> },
          { path: "admin", element: <Admin /> },
          { path: "history", element: <ProjectHistory /> },
          { path: "manage", element: <ManageProjects /> },
          { path: "teachers", element: <TeachersPage /> },
          { path: "students", element: <StudentsPage /> },
        ],
      },
    ],
    {
      future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      },
    },
  );

  return <RouterProvider router={router} />;
}

export default App;
