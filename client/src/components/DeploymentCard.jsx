import { ChevronRight, Terminal, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DeploymentCard = ({ deployment }) => {
  const navigate = useNavigate();

  const isNewVersion = deployment.reviews?.length > 0 && deployment.reviews.every(r => r.status === 'resolved');

  return (
    <div
      onClick={() => navigate(`/project/${deployment.id}`)}
      className="glass-card p-4 flex items-center gap-5 cursor-pointer hover:border-primary/50 group relative overflow-hidden"
    >
      {isNewVersion && (
        <div className="absolute top-2 right-2">
          <div className="bg-yellow-400 text-background text-[9px] font-black px-2 py-0.5 rounded-md shadow-[0_0_10px_rgba(250,204,21,0.4)] animate-pulse">
            NEW UPDATE
          </div>
        </div>
      )}

      <div className="w-14 h-14 bg-[#0e161f] rounded-xl flex items-center justify-center border border-white/5 shrink-0 shadow-inner overflow-hidden">
        {isNewVersion ? (
          <RefreshCw className="text-yellow-400 animate-spin-slow" size={24} />
        ) : (
          <Terminal className="text-textMuted group-hover:text-primary transition-colors" size={24} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-white truncate mb-1">{deployment.projectName}</h3>
          {isNewVersion && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>}
        </div>
        <p className="text-xs text-textMuted truncate">
          {deployment.description || "Deploying architectural subsystems..."}
        </p>
        <div className="flex gap-4 text-[11px] text-textMuted mt-2">
          <span>By {deployment.studentName}</span>
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-primary/50"></span>
            Mentor: {deployment.mentorName}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 pl-4 border-l border-white/5">
        <span className={`text-[10px] px-3 py-1 rounded-full uppercase font-bold tracking-wider ${deployment.status === 'active' ? 'bg-primary/10 text-primary'
            : deployment.status === 'completed' ? 'bg-green-500/10 text-green-400'
              : 'bg-white/5 text-textMuted'
          }`}>
          {deployment.status.replace('_', ' ')}
        </span>
        <ChevronRight className="text-textMuted group-hover:text-white transition-colors w-5 h-5" />
      </div>
    </div>
  );
};
export default DeploymentCard;
