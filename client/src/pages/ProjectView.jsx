import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchDeploymentById,
  addReview,
  updateReview,
  deleteReview,
  uploadImage,
  updateReviewStatus,
  addReply,
} from "../api";
import {
  ChevronLeft,
  MessageSquare,
  Send,
  X,
  AlertCircle,
  ExternalLink,
  Edit2,
  Trash2,
  Check,
  Image as ImageIcon,
  Paperclip,
  Clock,
  CheckCircle2,
  Circle,
  Lock,
  User,
  Reply,
  CornerDownRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = "";

const ProjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [project, setProject] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [user, setUser] = useState(null);

  const [attachedImage, setAttachedImage] = useState(null);
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    loadProject();
  }, [id]);

  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";

  useEffect(() => {
    if (project && isStudent && project.studentName !== user?.name) {
      navigate("/", { replace: true });
    }
  }, [project, isStudent, user, navigate]);

  const loadProject = () => {
    fetchDeploymentById(id).then(setProject);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedImage({
        file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        setAttachedImage({
          file,
          preview: URL.createObjectURL(file),
        });
      }
    }
  };

  const handleSendComment = async () => {
    if (!comment.trim() && !attachedImage) return;
    setSending(true);
    try {
      let imageUrl = null;
      if (attachedImage) {
        const uploadResult = await uploadImage(attachedImage.file);
        imageUrl = uploadResult.url;
      }

      await addReview(id, {
        comment,
        imageUrl,
        teacherName: user.name,
      });

      setComment("");
      setAttachedImage(null);
      loadProject();
    } catch (err) {
      alert("Failed to send review");
    } finally {
      setSending(false);
    }
  };

  const handleSendReply = async (reviewId) => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await addReply(id, reviewId, {
        name: user.name,
        text: replyText,
      });
      setReplyText("");
      setReplyingId(null);
      loadProject();
    } catch (err) {
      alert("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const handleUpdate = async (reviewId) => {
    if (!editValue.trim()) return;
    try {
      await updateReview(id, reviewId, editValue);
      setEditingId(null);
      loadProject();
    } catch (err) {
      alert("Failed to update");
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      await deleteReview(id, reviewId);
      loadProject();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleStatusToggle = async (reviewId, currentStatus) => {
    if (!isStudent) return; // Only students can toggle status

    const nextStatus = {
      pending: "in_progress",
      in_progress: "resolved",
      resolved: "pending",
    }[currentStatus];

    try {
      await updateReviewStatus(id, reviewId, nextStatus);
      loadProject();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (!project)
    return (
      <div className="p-20 text-center text-textMuted italic">
        Initializing secure link...
      </div>
    );

  const isExternal = project.deploymentUrl.startsWith("http");
  const needsBreakout =
    isExternal &&
    (project.deploymentUrl.includes("github.com") ||
      project.deploymentUrl.includes("google.com") ||
      project.deploymentUrl.includes("facebook.com"));

  const getHostname = () => {
    try {
      return isExternal
        ? new URL(project.deploymentUrl).hostname
        : "Local Project";
    } catch {
      return "Internal Source";
    }
  };

  const isNewVersion =
    project.reviews?.length > 0 &&
    project.reviews.every((r) => r.status === "resolved");

  return (
    <div className="fixed inset-0 bg-[#0a0f1d] flex flex-col z-[100] text-gray-100 font-sans">
      {/* Header Bar */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0d1821]/80 backdrop-blur-2xl z-20">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="font-bold text-lg tracking-tight">
                {project.projectName}
              </h1>
              {isNewVersion && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-yellow-400 text-background text-[9px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(250,204,21,0.3)] animate-pulse">
                  <AlertCircle size={10} /> Fully Resolved
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-textMuted font-bold uppercase tracking-widest">
              <span>Student: {project.studentName}</span>
              <span className="w-1 h-1 rounded-full bg-white/10"></span>
              <a
                href={project.deploymentUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                {project.deploymentUrl.slice(0, 40)}...{" "}
                <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={project.deploymentUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl flex items-center gap-2 bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all font-bold text-sm"
          >
            <ExternalLink size={16} />
            View in New Tab
          </a>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold text-sm border ${
              sidebarOpen
                ? "bg-primary text-background border-primary shadow-glow"
                : "bg-white/5 text-white hover:bg-white/10 border-white/10"
            }`}
          >
            <MessageSquare size={18} />
            Review Mode
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 relative bg-white">
          {needsBreakout ? (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0d1821] p-10 text-center">
              <div className="max-w-md w-full glass-card p-10 border-yellow-500/30">
                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500 mx-auto mb-6">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold mb-4">Iframe Restricted</h3>
                <p className="text-textMuted text-sm mb-8 leading-relaxed">
                  This project host ({getHostname()}) refuses to be displayed
                  inside another website for security reasons.
                </p>
                <a
                  href={project.deploymentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary w-full py-4 flex items-center justify-center gap-3"
                >
                  <ExternalLink size={20} />
                  Open Project Externally
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 flex items-center justify-center -z-10 bg-[#0a0f1d]">
                <div className="text-textMuted flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-xs font-bold uppercase tracking-widest">
                    Connecting to remote host...
                  </p>
                </div>
              </div>
              <iframe
                src={project.deploymentUrl}
                className="w-full h-full border-none relative z-10"
                title={project.projectName}
              />
            </>
          )}
        </div>

        {/* Review Sidebar */}
        <aside
          className={`transition-all duration-500 ease-in-out border-l border-white/10 bg-[#0d1821]/90 backdrop-blur-3xl flex flex-col shadow-2xl relative z-30
            ${sidebarOpen ? "w-[450px]" : "w-0 opacity-0 pointer-events-none translate-x-12"}`}
        >
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
            <div>
              <h2 className="font-black text-xs uppercase tracking-[0.2em] text-primary">
                Review Terminal
              </h2>
              <p className="text-textMuted text-[10px] mt-1">
                LOGGED AS {user?.name.toUpperCase()}
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 hover:bg-white/5 rounded-lg text-textMuted hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar bg-[#0d1821]/50">
            {project.reviews?.length > 0 ? (
              project.reviews.map((rev) => (
                <div key={rev.id} className="space-y-3">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`bg-white/5 rounded-2xl overflow-hidden border transition-all shadow-lg group
                      ${rev.status === "resolved" ? "border-green-500/30 opacity-60" : rev.status === "in_progress" ? "border-yellow-500/30" : "border-white/10 group-hover:border-primary/30"}`}
                  >
                    {rev.imageUrl && (
                      <div className="w-full border-b border-white/10 aspect-video bg-black/40 flex items-center justify-center overflow-hidden">
                        <img
                          src={`${API_BASE}${rev.imageUrl}`}
                          alt="Revision visual"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                          onClick={() =>
                            window.open(`${API_BASE}${rev.imageUrl}`, "_blank")
                          }
                        />
                      </div>
                    )}

                    <div className="p-4 relative">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {isStudent && (
                            <button
                              onClick={() =>
                                handleStatusToggle(
                                  rev.id,
                                  rev.status || "pending",
                                )
                              }
                              className={`p-1 rounded-md transition-all ${
                                rev.status === "resolved"
                                  ? "text-green-400"
                                  : rev.status === "in_progress"
                                    ? "text-yellow-400"
                                    : "text-textMuted hover:text-white"
                              }`}
                            >
                              {rev.status === "resolved" ? (
                                <CheckCircle2 size={16} />
                              ) : rev.status === "in_progress" ? (
                                <Clock size={16} />
                              ) : (
                                <Circle size={16} />
                              )}
                            </button>
                          )}
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                            {rev.teacherName}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-[9px] text-textMuted font-medium italic">
                            {new Date(rev.date).toLocaleTimeString()}
                          </p>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setReplyingId(rev.id);
                                setReplyText("");
                              }}
                              className="text-textMuted hover:text-white transition-colors"
                              title="Reply"
                            >
                              <Reply size={12} />
                            </button>
                            {isTeacher && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingId(rev.id);
                                    setEditValue(rev.comment);
                                  }}
                                  className="text-textMuted hover:text-primary transition-colors"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  onClick={() => handleDelete(rev.id)}
                                  className="text-textMuted hover:text-red-400 transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {editingId === rev.id ? (
                        <div className="space-y-3 mt-2">
                          <textarea
                            className="input-field w-full text-sm min-h-[80px]"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-[10px] uppercase font-bold text-textMuted hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdate(rev.id)}
                              className="flex items-center gap-1.5 bg-primary text-background px-3 py-1 rounded-lg text-[10px] uppercase font-black hover:shadow-glow transition-shadow"
                            >
                              <Check size={12} /> Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p
                          className={`text-sm leading-relaxed font-medium whitespace-pre-wrap ${rev.status === "resolved" ? "text-gray-500 line-through" : "text-gray-200"}`}
                        >
                          {rev.comment}
                        </p>
                      )}
                    </div>
                  </motion.div>

                  {/* Replies Rendering */}
                  <div className="ml-8 space-y-3">
                    {rev.replies?.map((rep) => (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={rep.id}
                        className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex gap-3 group"
                      >
                        <CornerDownRight
                          size={14}
                          className="text-textMuted shrink-0 mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-secondary">
                              {rep.name}
                            </span>
                            <span className="text-[8px] text-textMuted/50 font-medium">
                              {new Date(rep.date).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-300 leading-normal">
                            {rep.text}
                          </p>
                        </div>
                      </motion.div>
                    ))}

                    {replyingId === rev.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/10 rounded-xl p-3 space-y-3 border border-primary/20"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase text-primary">
                            Reply as {user.name}
                          </span>
                          <button onClick={() => setReplyingId(null)}>
                            <X size={12} />
                          </button>
                        </div>
                        <textarea
                          autoFocus
                          placeholder="Type your reply..."
                          className="w-full bg-transparent border-none text-[11px] focus:ring-0 p-0 resize-none min-h-[40px] text-white"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            !e.shiftKey &&
                            (e.preventDefault(), handleSendReply(rev.id))
                          }
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleSendReply(rev.id)}
                            disabled={!replyText.trim() || sending}
                            className="bg-primary text-background px-3 py-1 rounded-lg text-[10px] font-black uppercase hover:shadow-glow disabled:opacity-30"
                          >
                            {sending ? "..." : "Reply"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-10">
                <MessageSquare size={48} className="mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">
                  Empty Terminal
                </p>
                <p className="text-[10px] mt-2 italic px-10">
                  Waiting for logs.
                </p>
              </div>
            )}
          </div>

          {/* Teacher Input Area (Primary Notes) */}
          {isTeacher && (
            <div className="p-6 border-t border-white/10 bg-white/5">
              <AnimatePresence>
                {attachedImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mb-4 relative rounded-xl overflow-hidden border border-primary/50 aspect-video group"
                  >
                    <img
                      src={attachedImage.preview}
                      alt="Paste preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setAttachedImage(null)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-lg hover:scale-110 transition-transform"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative group">
                <textarea
                  onPaste={handlePaste}
                  className="input-field w-full pr-14 pl-12 resize-none min-h-[80px] border-white/10 group-focus-within:border-primary/50 transition-all placeholder:text-textMuted/50 text-sm py-4"
                  placeholder="Create a new correction note..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    (e.preventDefault(), handleSendComment())
                  }
                />

                <div className="absolute left-3 top-4 flex flex-col gap-3">
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="p-2 text-textMuted hover:text-primary hover:bg-white/5 rounded-lg transition-all"
                    title="Attach Photo"
                  >
                    <ImageIcon size={18} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </div>

                <button
                  onClick={handleSendComment}
                  disabled={sending || (!comment.trim() && !attachedImage)}
                  className="absolute right-4 bottom-4 p-3 bg-primary text-background rounded-xl hover:scale-105 transition-all shadow-glow"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-background/20 border-t-background rounded-full animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default ProjectView;
