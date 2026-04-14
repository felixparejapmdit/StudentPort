import { useState, useEffect } from "react";
import { fetchDeployments } from "../api";
import { motion } from "framer-motion";
import {
  History,
  MessageSquare,
  CheckCircle2,
  Clock,
  Rocket,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProjectHistory = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeployments()
      .then((data) => {
        const allEvents = [];

        data.forEach((project) => {
          // Event: Project Creation
          allEvents.push({
            id: `create-${project.id}`,
            projectId: project.id,
            projectName: project.projectName,
            type: "creation",
            user: project.studentName,
            text: `Deployed the initial version of ${project.projectName}`,
            date: project.date,
            icon: <Rocket size={14} className="text-primary" />,
          });

          // Event: Every Review Item
          project.reviews?.forEach((rev) => {
            allEvents.push({
              id: rev.id,
              projectId: project.id,
              projectName: project.projectName,
              type: "comment",
              user: rev.teacherName,
              text: `Added a correction note: "${rev.comment.substring(0, 60)}${rev.comment.length > 60 ? "..." : ""}"`,
              date: rev.date,
              status: rev.status,
              icon: <MessageSquare size={14} className="text-secondary" />,
            });

            // Event: Status Changes (If we had timestamps for status changes, we'd add them here)
            // For now, let's just highlight those that are resolved
            if (rev.status === "resolved") {
              allEvents.push({
                id: `res-${rev.id}`,
                projectId: project.id,
                projectName: project.projectName,
                type: "resolution",
                user: project.studentName,
                text: `Resolved the issue: "${rev.comment.substring(0, 60)}..."`,
                date: rev.editedAt || rev.date, // Best guess
                icon: <CheckCircle2 size={14} className="text-green-400" />,
              });
            }
          });
        });

        // Sort by date newest first
        allEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
        setEvents(allEvents);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-12"
    >
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black tracking-tighter mb-3 flex items-center gap-4">
            <History size={40} className="text-primary" />
            History
          </h1>
          <p className="text-gray-400 font-medium">
            View past deployments and review notes.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
          <TrendingUp size={16} className="text-primary" />
          <span className="text-xs font-black uppercase tracking-widest">
            {events.length} TOTAL EVENTS
          </span>
        </div>
      </header>

      <section className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-8 bottom-0 w-[2px] bg-gradient-to-b from-primary/50 via-white/5 to-transparent hidden md:block" />

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20 opacity-30 italic">
              Loading history...
            </div>
          ) : (
            events.map((event, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={event.id}
                onClick={() => navigate(`/project/${event.projectId}`)}
                className="group relative flex items-start gap-8 p-6 bg-white/[0.02] hover:bg-white/[0.05] rounded-3xl border border-white/5 hover:border-primary/30 transition-all cursor-pointer"
              >
                {/* Timeline Node */}
                <div className="hidden md:flex relative z-10 w-12 h-12 bg-[#0d1821] border border-white/10 rounded-2xl items-center justify-center shrink-0 group-hover:scale-110 group-hover:border-primary transition-all shadow-xl">
                  {event.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                        {event.type}
                      </span>
                      <h3 className="text-lg font-bold text-white leading-tight group-hover:text-primary transition-colors">
                        {event.text}
                      </h3>
                    </div>
                    <time className="text-[10px] font-black text-textMuted uppercase shrink-0 mt-1">
                      {new Date(event.date).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                      <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-black text-primary">
                        {event.user.charAt(0)}
                      </div>
                      <span className="text-[10px] font-bold text-gray-300">
                        {event.user}
                      </span>
                    </div>

                    <span className="text-textMuted text-[10px]">in</span>

                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary hover:underline">
                      {event.projectName}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={20} className="text-primary" />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default ProjectHistory;
