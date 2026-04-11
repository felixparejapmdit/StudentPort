import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchStudents } from '../api';
import { ShieldCheck, Users, ArrowRight, Rocket, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null); // 'teacher', 'student'
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudents().then(setStudents);
  }, []);

  const handleLogin = () => {
    setError('');
    if (role === 'teacher') {
      if (password === 'p@ssw0rd') {
        localStorage.setItem('user', JSON.stringify({ role: 'teacher', name: 'Admin' }));
        navigate('/');
      } else {
        setError('Wrong password. Please try again.');
      }
    } else if (role === 'student' && selectedStudent) {
      localStorage.setItem('user', JSON.stringify({ role: 'student', name: selectedStudent }));
      navigate('/');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0f1d] flex items-center justify-center z-[200]">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-[420px] p-10 relative"
      >
        <header className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 shadow-glow">
            <Rocket size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">StudentPort</h1>
          <p className="text-textMuted text-sm font-medium">Project Tracker</p>
        </header>

        {!role ? (
          <div className="space-y-4">
            <button 
              onClick={() => setRole('teacher')}
              className="w-full h-20 glass-card border-white/5 hover:border-primary/50 flex items-center gap-5 px-6 group transition-all"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all">
                <ShieldCheck />
              </div>
              <div className="text-left">
                <p className="font-bold text-lg">Teacher</p>
                <p className="text-xs text-textMuted">Manage projects and students</p>
              </div>
              <ArrowRight className="ml-auto text-textMuted group-hover:text-primary transition-all" />
            </button>

            <button 
              onClick={() => setRole('student')}
              className="w-full h-20 glass-card border-white/5 hover:border-secondary/50 flex items-center gap-5 px-6 group transition-all"
            >
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-background transition-all">
                <Users />
              </div>
              <div className="text-left">
                <p className="font-bold text-lg">Student</p>
                <p className="text-xs text-textMuted">See your work and notes</p>
              </div>
              <ArrowRight className="ml-auto text-textMuted group-hover:text-secondary transition-all" />
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <button 
                onClick={() => { setRole(null); setError(''); setPassword(''); }}
                className="text-[10px] uppercase font-black text-textMuted hover:text-white"
              >
                ← Back
              </button>
              <span className="text-[10px] uppercase font-black text-primary tracking-widest">{role} Login</span>
            </div>

            {role === 'student' ? (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-textMuted tracking-widest px-1">Find your name</label>
                <select 
                  className="input-field w-full bg-[#0a0f1d]"
                  value={selectedStudent}
                  onChange={e => setSelectedStudent(e.target.value)}
                >
                  <option value="">Select name...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-textMuted tracking-widest px-1">Teacher Password</label>
                <div className="relative group">
                   <input 
                    type="password"
                    placeholder="Enter password..."
                    className="input-field w-full pl-10"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition-colors" size={16} />
                </div>
              </div>
            )}

            {error && (
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-red-400 text-[10px] font-bold uppercase text-center"
              >
                {error}
              </motion.p>
            )}

            <button 
              onClick={handleLogin}
              disabled={(role === 'student' && !selectedStudent) || (role === 'teacher' && !password)}
              className="btn-primary w-full py-4 font-black tracking-widest uppercase text-sm disabled:opacity-30 flex items-center justify-center gap-3"
            >
              Start <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        <footer className="mt-10 text-center">
            <p className="text-[9px] text-textMuted uppercase tracking-widest font-bold opacity-30">Portal v2.0</p>
        </footer>
      </motion.div>
    </div>
  );
};

export default Login;
