import React, { useEffect, useState } from 'react';
import { futureLetterService } from '../../services/api';
import { useToast } from '../Shared/ToastContext';

export default function FutureLetterPage() {
  const { addToast } = useToast();
  const [letter, setLetter] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await futureLetterService.getLetter();
      if (res.data) {
        setLetter(res.data.content || '');
        setUpdatedAt(res.data.updatedAt);
      }
    } catch (err) {
      // ignore no-content error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const svc = updatedAt ? futureLetterService.updateLetter : futureLetterService.saveLetter;
      const res = await svc(letter);
      if (res.data) {
        setLetter(res.data.content || '');
        setUpdatedAt(res.data.updatedAt);
        addToast('Letter saved', 'success');
      }
    } catch (err) {
      let msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to save letter';
      if (typeof msg === 'object') msg = JSON.stringify(msg);
      addToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="section">
      <div className="container-max" style={{ maxWidth: 800 }}>
        <h2 className="section-title">Future Letter</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <textarea
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
              rows={12}
              style={{ width: '100%', padding: 12, fontSize: '16px', lineHeight: 1.5 }}
              placeholder="Write a message to your future self..."
            />
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="btn-primary" onClick={handleSave} disabled={saving || letter.trim() === ''}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              {updatedAt && (
                <span style={{ fontSize: '12px', color: '#666' }}>
                  Last updated: {new Date(updatedAt).toLocaleString()}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}