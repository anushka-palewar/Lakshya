import React from 'react';
import { Plus, Sparkles, FileText, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../../styles/ActionHub.css';

export default function ActionHub({ onAddDreamClick }) {
  const navigate = useNavigate();

  const handleAddDream = () => {
    navigate('/dreams/new');
  };
  return (
    <section className="section action-hub-section">
      <div className="container-max">
        {/* Title */}
        <h2 className="section-title">Action Hub</h2>

        {/* Grid */}
        <div className="action-grid">
          {/* Card 1: Add Dream */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="action-card"
            onClick={handleAddDream}
          >
            <div className="action-icon-wrapper">
              <button className="btn-circle-large">
                <Plus size={40} />
              </button>
            </div>
            <h3 className="action-card-title">Add a New Dream</h3>
            <p className="action-card-subtitle">Manifest your next aspiration</p>
          </motion.div>

          {/* Card 2: Future Letter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="action-card"
            onClick={() => navigate('/future-letter')}
          >
            <div className="action-icon-wrapper">
              <button className="btn-circle-large">
                <FileText size={40} />
              </button>
            </div>
            <h3 className="action-card-title">Future Letter</h3>
            <p className="action-card-subtitle">Write to your future self</p>
          </motion.div>

          {/* Card 3: Life Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="action-card"
            onClick={() => navigate('/analytics')}
          >
            <div className="action-icon-wrapper">
              <button className="btn-circle-large">
                <BarChart3 size={40} />
              </button>
            </div>
            <h3 className="action-card-title">Life Analytics</h3>
            <p className="action-card-subtitle">View your progress dashboard</p>
          </motion.div>

          {/* Card 4: Vision Board */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="action-card"
            onClick={() => navigate('/vision-board')}
          >
            <div className="action-icon-wrapper">
              <button className="btn-circle-large">
                <Sparkles size={40} />
              </button>
            </div>
            <h3 className="action-card-title">Vision Board</h3>
            <p className="action-card-subtitle">Visualize your dreams daily</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
