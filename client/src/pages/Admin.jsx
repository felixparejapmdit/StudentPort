import { useState, useEffect } from 'react';
import { createDeployment, fetchTeachers, fetchStudents, fetchProjects } from '../api';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Rocket } from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    project_id: '',
    student_id: '',
    mentor_id: '',
    deploymentUrl: '',
    description: '',
  });

  useEffect(() => {
    fetchTeachers().then(data => {
      setTeachers(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, mentor_id: data[0].id }));
      }
    });
    fetchStudents().then(data => {
      setStudents(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, student_id: data[0].id }));
      }
    });
    fetchProjects().then(data => {
      setProjects(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, project_id: data[0].id }));
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createDeployment({
        ...formData,
        project_id: Number(formData.project_id),
        student_id: Number(formData.student_id),
        mentor_id:  Number(formData.mentor_id),
      });
      navigate('/');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="glass-card p-10 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32"></div>

        <header className="mb-10 relative z-10">
          <div className="flex items-center gap-3 text-primary mb-2">
            <ShieldCheck size={24} />
            <span className="text-sm font-bold uppercase tracking-[0.3em]">Admin Area</span>
          </div>
          <h2 className="text-3xl font-bold">Add New Project</h2>
          <p className="text-gray-400 mt-2">Add a new student project to the portal.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-2 gap-6">
            {/* Project */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Project</label>
              <select
                required
                className="input-field w-full bg-[#0a0f1d]"
                value={formData.project_id}
                onChange={e => setFormData({ ...formData, project_id: e.target.value })}
              >
                <option value="">Select project...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Student */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Student</label>
              <select
                required
                className="input-field w-full bg-[#0a0f1d]"
                value={formData.student_id}
                onChange={e => setFormData({ ...formData, student_id: e.target.value })}
              >
                <option value="">Select student...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Deployment URL</label>
            <input
              required
              type="url"
              className="input-field w-full"
              value={formData.deploymentUrl}
              onChange={e => setFormData({ ...formData, deploymentUrl: e.target.value })}
              placeholder="https://project-url.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Mentor</label>
            <select
              required
              className="input-field w-full bg-[#0a0f1d]"
              value={formData.mentor_id}
              onChange={e => setFormData({ ...formData, mentor_id: e.target.value })}
            >
              <option value="">Select mentor...</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Description / Notes</label>
            <textarea
              rows="4"
              className="input-field w-full resize-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add some details about the project..."
            />
          </div>

          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-3 py-4 mt-4">
            <Rocket size={20} />
            Save Project
          </button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
