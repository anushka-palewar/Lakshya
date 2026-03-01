import React from 'react';
import { Plus, Lock } from 'lucide-react';
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

          {/* Card 2: Vision Board (Locked) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="action-card action-card-locked"
          >
            <div className="action-card-blur-overlay"></div>
            <div className="action-icon-wrapper">
              <div className="btn-circle-large" style={{ opacity: 0.5 }}>
                <Lock size={40} />
              </div>
            </div>
            <h3 className="action-card-title">Vision Board</h3>
            <p className="action-card-subtitle">Coming Soon</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
