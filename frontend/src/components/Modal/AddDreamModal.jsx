import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/AddDreamModal.css';
import { useToast } from '../Shared/ToastContext';
import { dreamService } from '../../services/api';

export default function AddDreamModal({ isOpen, onClose, onAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    imageUrl: '',
    description: '',
    category: 'Personal',
    dueDate: '',
    priority: 'Medium',
    isAchieved: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const { addToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    (async () => {
      try {
        const payload = {
          name: formData.name,
          imageUrl: formData.imageUrl,
          description: formData.description,
          dueDate: formData.dueDate || null,
          category: formData.category,
          priority: formData.priority,
          isAchieved: formData.isAchieved,
        };
        await dreamService.createDream(payload);
        addToast('Dream added', 'success');
        if (onAdded) onAdded();
      } catch (err) {
        let msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to create dream';
        if (typeof msg === 'object') msg = JSON.stringify(msg);
        addToast(msg, 'error');
      } finally {
        // Reset form and close
        setFormData({
          name: '',
          imageUrl: '',
          description: '',
          category: 'Personal',
          dueDate: '',
          priority: 'Medium',
          isAchieved: false,
        });
        onClose();
      }
    })();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="modal-backdrop"
          ></motion.div>

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="add-dream-modal"
          >
            {/* Header */}
            <div className="modal-header">
              <h2 className="modal-title">Add Your Dream</h2>
              <button className="modal-close" onClick={onClose}>
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="dream-form">
              {/* Dream Name */}
              <div className="form-group">
                <label className="form-label">Dream Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Learn Piano"
                  className="form-input"
                  required
                />
              </div>

              {/* Image URL */}
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="form-input"
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your dream in detail..."
                  className="form-textarea"
                  rows="4"
                ></textarea>
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Personal">Personal</option>
                  <option value="Career">Career</option>
                  <option value="Health">Health</option>
                  <option value="Financial">Financial</option>
                  <option value="Relationships">Relationships</option>
                </select>
              </div>

              {/* Target Date */}
              <div className="form-group">
                <label className="form-label">Target Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              {/* Priority */}
              <div className="form-group">
                <label className="form-label">Priority Level</label>
                <div className="priority-selector">
                  {['Low', 'Medium', 'High'].map((level) => (
                    <label key={level} className="priority-option">
                      <input
                        type="radio"
                        name="priority"
                        value={level}
                        checked={formData.priority === level}
                        onChange={handleChange}
                      />
                      <span className={`priority-label priority-${level.toLowerCase()}`}>
                        {level}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Is Achieved Checkbox */}
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

              {/* Submit Button */}
              <button type="submit" className="btn-primary btn-submit">
                Manifest This Dream ✨
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
