import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { dreamService } from '../../services/api';
import { useToast } from '../Shared/ToastContext';

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
            <label className="form-label">Target Date</label>
            <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="form-input" />
          </div>
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
    </section>
  );
}
