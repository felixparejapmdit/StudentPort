import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  History, 
  Settings, 
  LogOut, 
  Rocket, 
  User, 
  Users, 
  Folders, 
  FolderOpen,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const isTeacher = user?.role === 'teacher';

  return (
    <aside className={`
      fixed top-0 left-0 h-full w-[280px] bg-[#0d1821] border-r border-white/5 flex flex-col z-[80] transition-transform duration-300 ease-in-out
      ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Brand */}
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary shadow-glow shrink-0">
            <Rocket size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none">StudentPort</h1>
            <p className="text-[9px] font-black uppercase text-primary/60 tracking-widest mt-1">
              {isTeacher ? 'Teacher Platform' : 'Student Portal'}
            </p>
          </div>
        </div>
        {/* Close button for mobile */}
        <button 
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-2 text-textMuted hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 mt-4 overflow-y-auto px-4 space-y-2">
        <SidebarLink to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" onClick={() => setMobileOpen(false)} />
        
        {!isTeacher && (
           <SidebarLink to="/manage" icon={<FolderOpen size={18} />} label="Manage Projects" onClick={() => setMobileOpen(false)} />
        )}

        {isTeacher && (
          <>
            <SidebarLink to="/history" icon={<History size={18} />} label="Project History" onClick={() => setMobileOpen(false)} />
            <div className="mx-4 my-6 h-[1px] bg-white/5" />
            <p className="px-4 text-[10px] font-black uppercase text-textMuted tracking-[0.2em] mb-4">Administration</p>
            <SidebarLink to="/admin" icon={<Rocket size={18} />} label="Deploy Unit" onClick={() => setMobileOpen(false)} />
            <SidebarLink to="/manage" icon={<Folders size={18} />} label="Manage Projects" onClick={() => setMobileOpen(false)} />
            <SidebarLink to="/teachers" icon={<User size={18} />} label="Teachers" onClick={() => setMobileOpen(false)} />
            <SidebarLink to="/students" icon={<Users size={18} />} label="Students" onClick={() => setMobileOpen(false)} />
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-white/5 space-y-4">
        {user && (
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-textMuted uppercase font-black truncate">{user.role}</p>
            </div>
          </div>
        )}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-2xl transition-all font-bold text-sm"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

const SidebarLink = ({ to, icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) => `
      flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative
      ${isActive 
        ? 'bg-primary text-background font-bold shadow-glow border-r-4 border-primary' 
        : 'text-textMuted hover:text-white hover:bg-white/5'}
    `}
  >
    <div className="shrink-0 transition-transform group-hover:scale-110">{icon}</div>
    <span className="text-sm tracking-tight">{label}</span>
  </NavLink>
);

export default Sidebar;
