import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDeployments, fetchTeachers } from '../api';
import DeploymentCard from '../components/DeploymentCard';
import { 
  Activity, 
  Layers, 
  Server, 
  GraduationCap, 
  Users, 
  Bell, 
  Search, 
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherCount, setTeacherCount] = useState(0);
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'active'
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);
      
      fetchDeployments()
        .then(data => {
          const filteredData = parsedUser.role === 'student' 
            ? data.filter(d => d.studentName === parsedUser.name)
            : data;
          setDeployments(filteredData);
        })
        .finally(() => setLoading(false));
    }
    fetchTeachers().then(t => setTeacherCount(t.length));
  }, []);

  const completedProjects = deployments.filter(d => d.status === 'completed').length;
  const activeProjects = deployments.filter(d => d.status === 'active').length;
  const uniqueStudents = [...new Set(deployments.map(d => d.studentName))].length;

  const filteredDeployments = deployments.filter(d => {
    if (filter === 'all') return true;
    return d.status === filter;
  });

  // Calculate notifications from data
  const notifications = [];
  deployments.forEach(d => {
    d.reviews?.forEach(r => {
      // If it's a student, notify them of new teacher comments
      if (user?.role === 'student' && r.teacherName !== user.name) {
        notifications.push({
          id: r.id,
          project: d.projectName,
          projectId: d.id,
          text: `New comment from ${r.teacherName}`,
          date: r.date,
          status: r.status
        });
      }
      // If it's a teacher, notify them of resolved items
      if (user?.role === 'teacher' && r.status === 'resolved') {
        notifications.push({
          id: r.id,
          project: d.projectName,
          projectId: d.id,
          text: `${d.studentName} marked a comment as resolved`,
          date: r.date,
          status: r.status
        });
      }
    });
  });
  // Sort by date newest first
  notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-10"
    >
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-2">Project Dashboard</h1>
          <p className="text-gray-400">
            {user?.role === 'student' ? `Welcome back, ${user.name}. Track your progress below.` : 'View and manage all student projects.'}
          </p>
        </div>

        {user?.role === 'teacher' && (
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-3 rounded-2xl border transition-all relative ${showNotifications ? 'bg-primary text-background border-primary shadow-glow' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
            >
              <Bell size={24} />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 border-2 border-[#0a0f1d] rounded-full animate-bounce"></span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-80 glass-card p-0 overflow-hidden z-[100] shadow-2xl"
                >
                  <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-xs uppercase tracking-widest">Feed Update</h3>
                    <span className="text-[10px] text-primary font-black">{notifications.length} NEW</span>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => navigate(`/project/${n.projectId}`)}
                          className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 ${n.status === 'resolved' ? 'text-green-400' : 'text-primary'}`}>
                              {n.status === 'resolved' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-white line-clamp-2">{n.text}</p>
                              <p className="text-[9px] text-textMuted mt-1 uppercase font-black">{n.project}</p>
                              <p className="text-[8px] text-textMuted/50 mt-0.5">{new Date(n.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center text-textMuted italic text-xs">
                        No new activity found.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </header>

      {/* Hero Stats - ONLY FOR TEACHERS */}
      {user?.role === 'teacher' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <StatCard 
            icon={<Layers />} 
            label="Total Projects" 
            value={deployments.length} 
            color="primary" 
            unit="units"
            isActive={filter === 'all'}
            onClick={() => setFilter('all')}
          />
          <StatCard 
            icon={<Activity />} 
            label="Completed" 
            value={completedProjects} 
            color="secondary"
            isActive={filter === 'completed'}
            onClick={() => setFilter('completed')}
          />
          <StatCard 
            icon={<Server />} 
            label="Active Projects" 
            value={activeProjects} 
            color="primary" 
            unit="online"
            isActive={filter === 'active'}
            onClick={() => setFilter('active')}
          />
          <StatCard 
            icon={<GraduationCap />} 
            label="Teachers" 
            value={teacherCount} 
            color="primary" 
            onClick={() => navigate('/teachers')} 
          />
          <StatCard 
            icon={<Users />} 
            label="Students" 
            value={uniqueStudents} 
            color="primary" 
            onClick={() => navigate('/students')} 
          />
        </div>
      )}

      {/* Main List */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
            {user?.role === 'student' ? 'My Projects' : (filter === 'all' ? 'Recent Projects' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Projects`)}
          </h2>
          <div className="text-sm text-gray-400">
            {filter !== 'all' && (
              <button 
                onClick={() => setFilter('all')}
                className="text-xs font-bold text-primary hover:underline"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode='popLayout'>
            {filteredDeployments.map((deployment) => (
              <motion.div
                key={deployment.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <DeploymentCard deployment={deployment} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </motion.div>
  );
};

const StatCard = ({ icon, label, value, color, unit = "", onClick, isActive }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    onClick={onClick}
    className={`glass-card p-6 cursor-pointer border-t-2 transition-all ${
      isActive 
        ? 'bg-white/10 border-primary shadow-glow scale-105 z-10' 
        : 'border-white/5 hover:border-white/10'
    }`}
  >
    <div className={`p-2 rounded-lg w-fit mb-4 transition-colors ${
      isActive ? 'bg-primary text-background' : 'bg-white/5 text-primary'
    }`}>
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-black text-white">{value}</span>
      <span className="text-[10px] font-bold text-gray-500 uppercase">{unit}</span>
    </div>
    <div className="mt-4 flex items-center justify-between">
      <div className={`h-1 flex-1 rounded-full ${isActive ? 'bg-primary' : 'bg-white/10'}`}></div>
      <span className="text-[10px] font-bold text-primary ml-4 italic">Filter →</span>
    </div>
  </motion.div>
);

export default Dashboard;
