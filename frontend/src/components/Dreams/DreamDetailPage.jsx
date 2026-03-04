import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { dreamService } from '../../services/api';
import { useToast } from '../Shared/ToastContext';
import FocusMode from './FocusMode';

export default function DreamDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [dream, setDream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [focusOpen, setFocusOpen] = useState(false);
  const [prevEnergyScore, setPrevEnergyScore] = useState(0);
  const [animatingScore, setAnimatingScore] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await dreamService.getDream(id);
      const newDream = res.data;
      
      // Trigger animation if score increased
      if (newDream.energyScore > prevEnergyScore) {
        setAnimatingScore(true);
        setTimeout(() => setAnimatingScore(false), 600);
      }
      
      setPrevEnergyScore(newDream.energyScore || 0);
      setDream(newDream);
    } catch (err) {
      let msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to load dream';
      if (typeof msg === 'object') msg = JSON.stringify(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleDelete = async () => {
    const ok = window.confirm('Are you sure you want to delete this dream?');
    if (!ok) return;
    try {
      await dreamService.deleteDream(id);
      addToast('Dream deleted', 'success');
      navigate('/dreams');
    } catch (err) {
      addToast('Failed to delete dream', 'error');
    }
  };

  const handleMilestoneToggle = async (milestoneId, isCompleted) => {
    try {
      const milestone = dream.milestones.find(m => m.id === milestoneId);
      if (milestone) {
        await dreamService.updateMilestone(id, milestoneId, {
          title: milestone.title,
          description: milestone.description,
          dueDate: milestone.dueDate,
          difficultyLevel: milestone.difficultyLevel,
          isCompleted: isCompleted
        });
        // reload dream to see updated progress
        await load();
        addToast(isCompleted ? 'Milestone completed!' : 'Milestone unmarked', 'success');
      }
    } catch (err) {
      addToast('Failed to update milestone', 'error');
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!dream) return <div style={{ padding: 24 }}>Dream not found.</div>;

  return (
    <section className="section" style={{ animation: 'pageFadeIn 320ms ease-out' }}>
      <style>{`@keyframes pageFadeIn { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: translateY(0);} }`}</style>
      <div className="container-max">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <button className="btn-secondary" onClick={() => navigate('/dreams')}>Back</button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn-primary"
              onClick={() => navigate(`/dreams/${id}/edit`)}
            >
              Edit
            </button>
            <button
              className="btn-danger"
              onClick={handleDelete}
            >
              Delete
            </button>
            <button
              className="btn-primary"
              onClick={() => setFocusOpen(true)}
            >
              Enter Focus Mode
            </button>
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, maxWidth: 800 }}>
            <div style={{ width: '100%', height: 420, backgroundImage: `url(${dream.imageUrl || ''})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 12 }} />
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{ marginTop: 0 }}>{dream.name}</h1>
            <p style={{ color: '#666' }}>{dream.description}</p>

            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div><strong>Target Date:</strong> {dream.dueDate || '-'}</div>
              <div><strong>Progress:</strong> {dream.progress || 0}%</div>
              <div><strong>Category:</strong> {dream.category || '-'}</div>
              <div><strong>Priority:</strong> {dream.priority || '-'}</div>
            </div>

            <div style={{ marginTop: 20 }}>
              <h3>Milestones</h3>
              {dream.milestones && dream.milestones.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {dream.milestones.map((m, i) => (
                    <div 
                      key={i} 
                      style={{
                        padding: '12px',
                        backgroundColor: '#f8f8f8',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        borderLeft: m.isCompleted ? '4px solid #4caf50' : '4px solid #ccc'
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={m.isCompleted} 
                        onChange={(e) => handleMilestoneToggle(m.id, e.target.checked)}
                        style={{ marginTop: '4px', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, textDecoration: m.isCompleted ? 'line-through' : 'none' }}>
                          {m.title}
                        </div>
                        {m.description && <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{m.description}</div>}
                        <div style={{ fontSize: '12px', color: '#999', marginTop: '6px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          {m.difficultyLevel && (
                            <span style={{ 
                              backgroundColor: m.difficultyLevel === 'HARD' ? '#fdd' : m.difficultyLevel === 'MEDIUM' ? '#ffd' : '#dfd',
                              padding: '3px 8px',
                              borderRadius: '3px'
                            }}>
                              {m.difficultyLevel}
                            </span>
                          )}
                          {m.riskStatus && (
                            <span style={{ 
                              backgroundColor: m.riskStatus === 'Overdue' ? '#fdd' : m.riskStatus === 'At Risk' ? '#ffd' : '#dfd',
                              padding: '3px 8px',
                              borderRadius: '3px'
                            }}>
                              {m.riskStatus}
                            </span>
                          )}
                          {m.urgencyScore > 0 && (
                            <span title="Urgency">⚡ {m.urgencyScore}/100</span>
                          )}
                          {m.stalled && <span style={{ color: '#f44' }}>⏸️ Stalled</span>}
                          {m.predictedCompletionDate && (
                            <span>Est. {new Date(m.predictedCompletionDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#888' }}>No milestones yet.</p>
              )}
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <h3 style={{ margin: 0 }}>Dream Energy</h3>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold',
                  color: '#4f46e5'
                }}>
                  {dream.energyScore || 0}/100
                </span>
              </div>
              <style>{`
                @keyframes scoreGlow { 
                  0%, 100% { box-shadow: 0 0 8px rgba(79, 70, 229, 0.4); }
                  50% { box-shadow: 0 0 16px rgba(79, 70, 229, 0.8); }
                }
                @keyframes scoreProgress {
                  0% { width: 0%; }
                  100% { width: ${dream.energyScore || 0}%; }
                }
                .energy-bar-glow {
                  animation: ${animatingScore ? 'scoreGlow 600ms ease-in-out' : 'none'};
                }
              `}</style>
              <div 
                style={{ 
                  width: '100%', 
                  height: 24, 
                  backgroundColor: '#f0f0f0', 
                  borderRadius: 12, 
                  overflow: 'hidden',
                  border: '1px solid #e0e0e0'
                }}
                className="energy-bar-glow"
              >
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${dream.energyScore || 0}%`, 
                    backgroundColor: '#4f46e5',
                    borderRadius: 12,
                    transition: 'width 600ms ease-out',
                    boxShadow: animatingScore ? '0 0 12px rgba(79, 70, 229, 0.8)' : 'none'
                  }}
                />
              </div>
              <p style={{ marginTop: 8, fontSize: '12px', color: '#888' }}>
                Based on completed milestones, days tracked, gratitude entries, and focus sessions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {focusOpen && (
        <FocusMode
          dream={{ id: dream.id, name: dream.name, imageUrl: dream.imageUrl, description: dream.description }}
          onClose={() => setFocusOpen(false)}
        />
      )}
    </section>
  );
}
