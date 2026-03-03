import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { dreamService } from '../../services/api';
import { useToast } from '../Shared/ToastContext';
import { Sparkles, X, CheckCircle2 } from 'lucide-react';
import FocusMode from './FocusMode';

export default function DreamFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    imageUrl: '',
    description: '',
    category: 'Personal',
    dueDate: '',
    priority: 'Medium',
    isAchieved: false,
  });
  const [loading, setLoading] = useState(false);
    const [milestones, setMilestones] = useState([]);
    const [suggestedMilestones, setSuggestedMilestones] = useState([]);
    const [suggestLoading, setSuggestLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestions, setSelectedSuggestions] = useState(new Set());
  const handleGenerateMilestones = async () => {
    if (!formData.name.trim()) {
      addToast('Please enter a dream name first', 'error');
      return;
    }
    setSuggestLoading(true);
    setSelectedSuggestions(new Set());
    try {
      const res = await dreamService.suggestMilestones(formData.name, formData.description);
      setSuggestedMilestones(res.data || []);
      setShowSuggestions(true);
    } catch (err) {
      let msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to generate suggestions';
      if (typeof msg === 'object') msg = JSON.stringify(msg);
      addToast(msg, 'error');
    } finally {
      setSuggestLoading(false);
    }
  };

  const toggleSuggestionSelection = (index) => {
    const newSet = new Set(selectedSuggestions);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedSuggestions(newSet);
  };

  const handleAddSelectedMilestones = () => {
    const selected = Array.from(selectedSuggestions)
      .map(i => suggestedMilestones[i])
      .filter(m => m && !milestones.includes(m));
    setMilestones(prev => [...prev, ...selected]);
    setShowSuggestions(false);
    setSuggestedMilestones([]);
    setSelectedSuggestions(new Set());
    if (selected.length > 0) {
      addToast(`Added ${selected.length} milestone(s)`, 'success');
    }
  };

  const removeMilestone = (index) => {
    setMilestones(prev => prev.filter((_, i) => i !== index));
  };

  const [focusOpen, setFocusOpen] = useState(false);

  useEffect(() => {
    if (isEdit) {
      (async () => {
        setLoading(true);
        try {
          const res = await dreamService.getDream(id);
          const d = res.data;
          setFormData({
            name: d.name || '',
            imageUrl: d.imageUrl || '',
            description: d.description || '',
            category: d.category || 'Personal',
            dueDate: d.dueDate || '',
            priority: d.priority || 'Medium',
            isAchieved: d.isAchieved || false,
          });
        } catch (err) {
          let msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to load dream';
          if (typeof msg === 'object') msg = JSON.stringify(msg);
          addToast(msg, 'error');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        imageUrl: formData.imageUrl,
        description: formData.description,
        category: formData.category,
        dueDate: formData.dueDate || null,
        priority: formData.priority,        isAchieved: formData.isAchieved,      };
      if (isEdit) {
        await dreamService.updateDream(id, payload);
        addToast('Dream updated', 'success');
      } else {
        await dreamService.createDream(payload);
        addToast('Dream added', 'success');
      }
      navigate('/dreams');
    } catch (err) {
      let msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to save dream';
      if (typeof msg === 'object') msg = JSON.stringify(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <div className="container-max">
        <h2 className="section-title">{isEdit ? 'Edit Dream' : 'Add New Dream'}</h2>
        <form onSubmit={handleSubmit} className="dream-form">
          <div className="form-group">
            <label className="form-label">Dream Name</label>
            <input name="name" value={formData.name} onChange={handleChange} required className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="form-textarea" rows={4} />
          </div>
            <div className="form-group">
              <label className="form-label">Milestones</label>
              <button
                type="button"
                onClick={handleGenerateMilestones}
                disabled={suggestLoading}
                className="btn-primary"
                style={{ marginBottom: '12px', opacity: suggestLoading ? 0.6 : 1 }}
              >
                {suggestLoading ? (
                  <>
                    <Sparkles size={16} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} style={{ marginRight: '8px' }} />
                    ✨ Generate Smart Milestones
                  </>
                )}
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {milestones.map((milestone, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <CheckCircle2 size={16} style={{ marginRight: '8px', color: '#4CAF50' }} />
                    <span style={{ flex: 1 }}>{milestone}</span>
                    <button
                      type="button"
                      onClick={() => removeMilestone(idx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#999'
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          <div className="form-group">
            <label className="form-label">Target Date</label>
            <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="form-input" />
          </div>
          {isEdit && (
            <div className="form-group">
              <button
                type="button"
                onClick={() => setFocusOpen(true)}
                className="btn-primary"
                style={{ marginTop: 8 }}
              >
                Enter Focus Mode
              </button>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                name="isAchieved"
                checked={formData.isAchieved}
                onChange={(e) => setFormData((p) => ({ ...p, isAchieved: e.target.checked }))}
                style={{ marginRight: '8px' }}
              />
              Dream Completed
            </label>
          </div>
          <div className="form-group">
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : isEdit ? 'Update Dream' : 'Create Dream'}</button>
          </div>
        </form>
      </div>
        {showSuggestions && (
          <>
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}
              onClick={() => setShowSuggestions(false)}
            >
              <div
                style={{
                  backgroundColor: 'white',
                  padding: '24px',
                  borderRadius: '12px',
                  maxWidth: '500px',
                  maxHeight: '80vh',
                  overflowY: 'auto',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Select Milestones</h3>
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}
                  >
                    <X size={24} />
                  </button>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  {suggestedMilestones.map((suggestion, idx) => (
                    <label
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        marginBottom: '8px',
                        backgroundColor: selectedSuggestions.has(idx) ? '#e8f5e9' : '#f5f5f5',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        border: selectedSuggestions.has(idx) ? '2px solid #4CAF50' : '2px solid transparent'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSuggestions.has(idx)}
                        onChange={() => toggleSuggestionSelection(idx)}
                        style={{ marginRight: '12px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px' }}>{suggestion}</span>
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(false)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#f0f0f0',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSelectedMilestones}
                    disabled={selectedSuggestions.size === 0}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: selectedSuggestions.size === 0 ? '#ccc' : '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: selectedSuggestions.size === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Add Selected ({selectedSuggestions.size})
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        {focusOpen && (
          <FocusMode dream={{
            id: id,
            name: formData.name,
            imageUrl: formData.imageUrl,
            description: formData.description
          }} onClose={() => setFocusOpen(false)} />
        )}
    </section>
  );
}
