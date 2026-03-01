import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../../styles/DreamStream.css';

export default function DreamStream({ dreams = [], loading = false }) {
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  const filtered =
    filter === 'All' ? dreams : dreams.filter((d) => (d.category || 'Personal') === filter);

  return (
    <section className="section dream-stream-section">
      <div className="container-max">
        {/* Header */}
        <div className="dream-stream-header">
          <div className="dream-stream-titles">
            <h2 className="section-title">Your Dream Stream</h2>
            <p className="section-subtitle">Scroll through the visions you&apos;re manifesting into reality.</p>
          </div>

          {/* Filter Dropdown */}
          <div className="filter-dropdown">
            {['All', 'Personal', 'Career', 'Health'].map((category) => (
              <button
                key={category}
                className={`filter-btn ${filter === category ? 'active' : ''}`}
                onClick={() => setFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Container */}
        <div className="dream-cards-scroll">
          {loading ? (
            <p>Loading dreams...</p>
          ) : filtered.length === 0 ? (
            <p>No dreams yet. Create your first dream ✨</p>
          ) : (
            filtered.map((d, index) => (
              <motion.div
                key={d.id || index}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="dream-card"
              >
                <div
                  className="dream-card-image"
                  style={{ backgroundImage: d.imageUrl ? `url(${d.imageUrl})` : undefined }}
                >
                  <div className="dream-card-overlay"></div>

                  <div className="dream-card-content">
                    <h3 className="dream-card-title" style={{ textDecoration: d.isAchieved ? 'line-through' : 'none', opacity: d.isAchieved ? 0.7 : 1 }}>
                      {d.name || 'Untitled'}
                      {d.isAchieved && <span style={{ marginLeft: '8px', color: '#2ecc71', fontSize: '0.9em' }}>✓</span>}
                    </h3>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${d.progress || 0}%` }}></div>
                    </div>
                    <span className="progress-text">{d.progress || 0}%</span>
                    <div className="dream-meta">Target: {d.dueDate || '-'}</div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <button className="btn-secondary" onClick={() => navigate('/dreams')}>View All Dreams</button>
        </div>
      </div>
    </section>
  );
}
