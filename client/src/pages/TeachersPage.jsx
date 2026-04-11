import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchTeachers, createTeacher, updateTeacher, deleteTeacher } from '../api';
import { GraduationCap, Plus, Search, Edit2, Trash2, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 5;

const emptyForm = { name: '', email: '', subject: '' };

const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    fetchTeachers().then(setTeachers).finally(() => setLoading(false));
  };

  const filtered = teachers.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase()) ||
    t.subject?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v) => { setSearch(v); setPage(1); };

  const handleAdd = async () => {
    setSaving(true);
    try { await createTeacher(addForm); setAddForm(emptyForm); setShowAdd(false); load(); }
    catch { alert('Error adding teacher'); }
    finally { setSaving(false); }
  };

  const handleEdit = (t) => { setEditId(t.id); setEditForm({ ...t }); };
  const handleCancel = () => setEditId(null);

  const handleSave = async (id) => {
    setSaving(true);
    try { await updateTeacher(id, editForm); setEditId(null); load(); }
    catch { alert('Error updating teacher'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this teacher?')) return;
    try { await deleteTeacher(id); load(); }
    catch { alert('Error deleting teacher'); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
            <GraduationCap className="text-primary" /> Teachers
          </h1>
          <p className="text-textMuted">Manage all teachers and their subjects.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus size={16} /> Add Teacher
        </button>
      </header>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
        <input
          className="input-field w-full pl-11"
          placeholder="Search by name, email or subject..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
        />
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass-card p-6 border border-primary/30 grid grid-cols-1 md:grid-cols-3 gap-4">
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest md:col-span-3">New Teacher</h3>
              {[['Name', 'name'], ['Email', 'email'], ['Subject', 'subject']].map(([label, key]) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-textMuted">{label}</label>
                  <input className="input-field w-full py-2 px-3 text-sm" value={addForm[key]} onChange={e => setAddForm({ ...addForm, [key]: e.target.value })} />
                </div>
              ))}
              <div className="flex gap-3 md:col-span-3">
                <button onClick={handleAdd} disabled={saving} className="btn-primary px-6 py-2.5 text-sm">
                  <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setShowAdd(false)} className="px-6 py-2.5 text-sm text-textMuted hover:text-white border border-border rounded-xl transition-colors">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <section className="glass-card overflow-hidden">
        {loading ? (
          <div className="text-center py-20 opacity-50">Loading teachers...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-white/5 text-xs uppercase font-bold text-textMuted border-b border-border">
                  <tr>
                    <th className="px-6 py-4">#</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((t, i) => (
                    <>
                      <tr key={t.id} className="border-b border-border hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-textMuted">{(page - 1) * PAGE_SIZE + i + 1}</td>
                        <td className="px-6 py-4 font-bold text-white">{t.name}</td>
                        <td className="px-6 py-4 text-textMuted">{t.email}</td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded uppercase font-bold tracking-wider">{t.subject}</span>
                        </td>
                        <td className="px-6 py-4 flex items-center justify-end gap-3">
                          <button onClick={() => editId === t.id ? handleCancel() : handleEdit(t)} className={editId === t.id ? 'text-gray-400 hover:text-white' : 'text-primary hover:text-primary/70'}>
                            {editId === t.id ? <X size={18} /> : <Edit2 size={18} />}
                          </button>
                          <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                        </td>
                      </tr>
                      <AnimatePresence>
                        {editId === t.id && (
                          <tr key={`edit-${t.id}`}>
                            <td colSpan="5" className="p-0">
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                <div className="bg-white/5 border-b border-border px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {[['Name', 'name'], ['Email', 'email'], ['Subject', 'subject']].map(([label, key]) => (
                                    <div key={key} className="space-y-1.5">
                                      <label className="text-[10px] font-bold uppercase tracking-widest text-textMuted">{label}</label>
                                      <input className="input-field w-full py-2 px-3 text-sm" value={editForm[key] || ''} onChange={e => setEditForm({ ...editForm, [key]: e.target.value })} />
                                    </div>
                                  ))}
                                  <div className="flex gap-3 md:col-span-3">
                                    <button onClick={() => handleSave(t.id)} disabled={saving} className="btn-primary px-6 py-2.5 text-sm">
                                      <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button onClick={handleCancel} className="px-6 py-2.5 text-sm text-textMuted hover:text-white border border-border rounded-xl transition-colors">Cancel</button>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <div className="text-center py-10 opacity-50">No teachers found.</div>}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border text-sm text-textMuted">
                <span>Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-30"><ChevronLeft size={16} /></button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setPage(n)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${page === n ? 'bg-primary text-background' : 'hover:bg-white/5'}`}>{n}</button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-30"><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </motion.div>
  );
};

export default TeachersPage;
