import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dreamService } from '../../services/api';
import { useToast } from '../Shared/ToastContext';
import '../../styles/DreamStream.css';

export default function DreamsListPage() {
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await dreamService.getDreams();
      setDreams(res.data || []);
    } catch (err) {
      let msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to load dreams';
      if (typeof msg === 'object') msg = JSON.stringify(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    const ok = window.confirm('Are you sure you want to delete this dream?');
    if (!ok) return;
    try {
      await dreamService.deleteDream(id);
      addToast('Dream deleted', 'success');
      load();
    } catch (err) {
      addToast('Failed to delete dream', 'error');
    }
  };

  return (
    <section className="section dream-stream-section">
      <div className="container-max">
        <div className="dream-stream-header">
          <div className="dream-stream-titles">
            <h2 className="section-title">All Dreams</h2>
            <p className="section-subtitle">Manage your dreams and track progress.</p>
          </div>
          <div>
            <button className="btn-primary" onClick={() => navigate('/dreams/new')}>+ Add New Dream</button>
          </div>
        </div>

        {loading ? (
          <p>Loading dreams...</p>
        ) : dreams.length === 0 ? (
          <p>No dreams yet. Create your first dream ✨</p>
        ) : (
          <div className="dream-cards-grid">
            {dreams.map((d) => (
              <div key={d.id} className="dream-card">
                <div className="dream-card-image" style={{ backgroundImage: `url(${d.imageUrl || ''})` }}>
                  <div className="dream-card-overlay"></div>
                  <div className="dream-card-content">
                    <h3 className="dream-card-title" style={{ textDecoration: d.isAchieved ? 'line-through' : 'none', opacity: d.isAchieved ? 0.7 : 1 }}>
                      {d.name || 'Untitled'}
                      {d.isAchieved && <span style={{ marginLeft: '8px', color: '#2ecc71', fontSize: '0.9em' }}>✓ Completed</span>}
                    </h3>
                    <p className="dream-card-desc">{(d.description || '').slice(0, 80)}</p>
                    <div className="dream-card-meta">
                      <span>Target: {d.dueDate || '-'}</span>
                      <span>Progress: {d.progress || 0}%</span>
                    </div>
                    <div className="dream-card-actions">
                      <button onClick={() => navigate(`/dreams/${d.id}/edit`)}>Edit</button>
                      <button onClick={() => handleDelete(d.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
