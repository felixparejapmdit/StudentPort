import React, { useState, useEffect } from 'react';
import { fetchDeployments, deleteDeployment, updateDeployment, fetchTeachers } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit2, Save, X, Link, Calendar, AlignLeft, ShieldAlert } from 'lucide-react';

const ManageProjects = () => {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);
      loadDeployments(parsedUser);
    }
    fetchTeachers().then(setTeachers);
  }, []);

  const loadDeployments = (currentUser) => {
    setLoading(true);
    fetchDeployments()
      .then(data => {
        // Filter if student
        const filtered = currentUser.role === 'student' 
          ? data.filter(d => d.studentName === currentUser.name)
          : data;
        setDeployments(filtered);
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteDeployment(id);
      loadDeployments(user);
    } catch (err) {
      alert('Error deleting project');
    }
  };

  const handleEdit = (deployment) => {
    setEditId(deployment.id);
    const d = new Date(deployment.date);
    const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 16);
    setEditForm({ ...deployment, date: localDate });
  };

  const handleCancel = () => setEditId(null);

  const handleSave = async (id) => {
    setSaving(true);
    try {
      // Create payload, preventing students from editing critical fields
      const payload = {
        ...editForm,
        date: new Date(editForm.date).toISOString(),
      };
      
      if (user.role === 'student') {
        // Students can't change these even if they try to hack the state
        payload.studentName = user.name;
        // Keep existing mentor if not provided or restricted
        const original = deployments.find(d => d.id === id);
        payload.mentorName = original.mentorName;
      }

      await updateDeployment(id, payload);
      setEditId(null);
      loadDeployments(user);
    } catch (err) {
      alert('Error updating project');
    } finally {
      setSaving(false);
    }
  };

  const isTeacher = user?.role === 'teacher';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
          {isTeacher ? 'Manage All Projects' : 'Manage My Projects'}
        </h1>
        <p className="text-textMuted">
          {isTeacher ? 'Full administrative access to all student deployments.' : 'Update your project details and deployment links.'}
        </p>
      </header>

      <section className="glass-card overflow-hidden">
        {loading ? (
          <div className="text-center py-20 opacity-50 text-primary font-bold animate-pulse">SYNCHRONIZING REPOSITORY...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-white/5 text-xs uppercase font-bold text-textMuted border-b border-border">
                <tr>
                  <th className="px-6 py-4">Project</th>
                  {isTeacher && <th className="px-6 py-4">Student</th>}
                  <th className="px-6 py-4">Mentor</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deployments.map(d => (
                  <React.Fragment key={d.id}>
                    <tr className="border-b border-border hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white group-hover:text-primary transition-colors">{d.projectName}</div>
                        {!isTeacher && <div className="text-[10px] text-textMuted truncate max-w-[200px]">{d.deploymentUrl}</div>}
                      </td>
                      {isTeacher && <td className="px-6 py-4 text-textMuted">{d.studentName}</td>}
                      <td className="px-6 py-4 text-textMuted">{d.mentorName}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] px-3 py-1 rounded-full uppercase font-bold tracking-wider ${
                          d.status === 'active' ? 'bg-primary/10 text-primary'
                          : d.status === 'completed' ? 'bg-green-500/10 text-green-400'
                          : 'bg-white/5 text-textMuted'
                        }`}>
                          {d.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex items-center justify-end gap-3">
                        <button
                          onClick={() => editId === d.id ? handleCancel() : handleEdit(d)}
                          className={`transition-all p-2 rounded-lg hover:bg-white/5 ${editId === d.id ? 'text-white' : 'text-primary'}`}
                          title={editId === d.id ? 'Cancel' : 'Edit'}
                        >
                          {editId === d.id ? <X size={18} /> : <Edit2 size={18} />}
                        </button>
                        {isTeacher && (
                          <button onClick={() => handleDelete(d.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400" title="Delete">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Inline Edit Panel */}
                    <AnimatePresence>
                      {editId === d.id && (
                        <tr key={`edit-${d.id}`}>
                          <td colSpan={isTeacher ? 5 : 4} className="p-0">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="bg-white/[0.02] border-b border-border px-6 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                
                                {/* Restricted or Editable fields based on role */}
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-textMuted">Project Name</label>
                                  <input
                                    className="input-field w-full py-2.5 px-3 text-sm"
                                    value={editForm.projectName || ''}
                                    onChange={(e) => setEditForm({ ...editForm, projectName: e.target.value })}
                                  />
                                </div>

                                {isTeacher ? (
                                  <>
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-textMuted">Student Name</label>
                                      <input
                                        className="input-field w-full py-2.5 px-3 text-sm"
                                        value={editForm.studentName || ''}
                                        onChange={(e) => setEditForm({ ...editForm, studentName: e.target.value })}
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-textMuted">Mentor</label>
                                      <select
                                        className="input-field w-full py-2.5 px-3 text-sm bg-background"
                                        value={editForm.mentorName || ''}
                                        onChange={(e) => setEditForm({ ...editForm, mentorName: e.target.value })}
                                      >
                                        {teachers.map(t => (
                                          <option key={t.id} value={t.name}>{t.name}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </>
                                ) : (
                                  <div className="space-y-1.5 opacity-50 grayscale">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-textMuted flex items-center gap-2"><ShieldAlert size={10} /> Mentor (Read Only)</label>
                                    <div className="input-field w-full py-2.5 px-3 text-sm">{d.mentorName}</div>
                                  </div>
                                )}

                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-textMuted flex items-center gap-1.5">
                                    <Link size={10} /> Deployment URL
                                  </label>
                                  <input
                                    type="url"
                                    className="input-field w-full py-2.5 px-3 text-sm"
                                    value={editForm.deploymentUrl || ''}
                                    onChange={(e) => setEditForm({ ...editForm, deploymentUrl: e.target.value })}
                                  />
                                </div>

                                {isTeacher && (
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-textMuted">Status</label>
                                    <select
                                      className="input-field w-full py-2.5 px-3 text-sm bg-background"
                                      value={editForm.status}
                                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                    >
                                      <option value="active">Active</option>
                                      <option value="in_progress">In Progress</option>
                                      <option value="completed">Completed</option>
                                    </select>
                                  </div>
                                )}

                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-textMuted flex items-center gap-1.5">
                                    <Calendar size={10} /> Date
                                  </label>
                                  <input
                                    type="datetime-local"
                                    readOnly={!isTeacher}
                                    className={`input-field w-full py-2.5 px-3 text-sm ${!isTeacher ? 'opacity-50' : ''}`}
                                    value={editForm.date || ''}
                                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                  />
                                </div>

                                <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-textMuted flex items-center gap-1.5">
                                    <AlignLeft size={10} /> Description / Readme
                                  </label>
                                  <textarea
                                    rows={4}
                                    className="input-field w-full py-2.5 px-3 text-sm resize-none"
                                    value={editForm.description || ''}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                  />
                                </div>

                                <div className="flex gap-3 md:col-span-2 lg:col-span-3">
                                  <button
                                    onClick={() => handleSave(d.id)}
                                    disabled={saving}
                                    className="btn-primary px-8 py-3 text-sm disabled:opacity-50 shadow-glow"
                                  >
                                    <Save size={16} /> {saving ? 'Updating...' : 'Save Changes'}
                                  </button>
                                  <button
                                    onClick={handleCancel}
                                    className="px-8 py-3 text-sm text-textMuted hover:text-white border border-border rounded-xl transition-all hover:bg-white/5"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            {deployments.length === 0 && (
              <div className="text-center py-20 text-textMuted italic">No projects found in this repository.</div>
            )}
          </div>
        )}
      </section>
    </motion.div>
  );
};

export default ManageProjects;
