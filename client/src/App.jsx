import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import ProjectHistory from './pages/ProjectHistory';
import ManageProjects from './pages/ManageProjects';
import ProjectView from './pages/ProjectView';
import TeachersPage from './pages/TeachersPage';
import StudentsPage from './pages/StudentsPage';
import Login from './pages/Login';
import { Menu, X } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Protected wrapper
  const ProtectedRoute = ({ children }) => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return <Navigate to="/login" />;
    return children;
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-[#0a0f1d] text-white">
        <Routes>
          <Route path="/login" element={null} />
          <Route path="/project/:id" element={null} />
          <Route path="*" element={
            <ProtectedRoute>
              {/* Hamburger Button for Mobile */}
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden fixed top-6 left-6 z-[60] p-3 bg-white/5 border border-white/10 rounded-xl"
              >
                <Menu size={24} />
              </button>
              
              <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
              
              {/* Overlay for mobile sidebar */}
              {mobileMenuOpen && (
                <div 
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] lg:hidden"
                  onClick={() => setMobileMenuOpen(false)}
                />
              )}
            </ProtectedRoute>
          } />
        </Routes>

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/project/:id" element={<ProjectView />} />
          
          <Route path="*" element={
            <ProtectedRoute>
              <main className="flex-1 lg:ml-[280px] w-full min-h-screen p-4 md:p-8 lg:p-12 transition-all">
                <div className="max-w-7xl mx-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/history" element={<ProjectHistory />} />
                    <Route path="/manage" element={<ManageProjects />} />
                    <Route path="/teachers" element={<TeachersPage />} />
                    <Route path="/students" element={<StudentsPage />} />
                  </Routes>
                </div>
              </main>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
