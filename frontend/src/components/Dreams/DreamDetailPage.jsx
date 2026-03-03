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

  const load = async () => {
    setLoading(true);
    try {
      const res = await dreamService.getDream(id);
      setDream(res.data);
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
                <ul>
                  {dream.milestones.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#888' }}>No milestones yet.</p>
              )}
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
