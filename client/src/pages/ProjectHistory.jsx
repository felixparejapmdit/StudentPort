import { useState, useEffect } from 'react';
import { fetchDeployments } from '../api';
import DeploymentCard from '../components/DeploymentCard';
import { motion } from 'framer-motion';

const ProjectHistory = () => {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeployments()
      .then(setDeployments)
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Project History</h1>
        <p className="text-gray-400">A timeline of all student projects submitted.</p>
      </header>

      <section className="space-y-6">
        {loading ? (
          <div className="text-center py-20 opacity-50">Loading history...</div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="grid gap-4"
          >
            {deployments.map(d => (
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
                key={d.id}
              >
                <DeploymentCard deployment={d} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </motion.div>
  );
};

export default ProjectHistory;
