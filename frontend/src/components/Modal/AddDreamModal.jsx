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

  const [imageSearchResults, setImageSearchResults] = useState([]);
  const [imageSearchLoading, setImageSearchLoading] = useState(false);
  const [imageGenerateLoading, setImageGenerateLoading] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [manualSearch, setManualSearch] = useState('');
  const manualTimer = React.useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const { addToast } = useToast();

  const handleImageSearch = async (customQuery) => {
    if (!customQuery && !formData.name.trim() && !formData.description.trim()) {
      addToast('Please enter a dream name or description first', 'error');
      return;
    }
    setImageSearchLoading(true);
    setImageSearchResults([]);
    try {
      const res = await dreamService.searchImages(formData.name, formData.description, formData.category, customQuery || null);
      const data = res.data || [];
      setImageSearchResults(data);
      if (data.length === 0) {
        addToast('No images found. Try refining your search keywords.', 'warning');
      }
    } catch (err) {
      let msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to search images';
      if (typeof msg === 'object') msg = JSON.stringify(msg);
      addToast(msg, 'error');
    } finally {
      setImageSearchLoading(false);
    }
  };

  const handleImageGenerate = async () => {
    if (!formData.name.trim() && !formData.description.trim()) {
      addToast('Please enter a dream name or description first', 'error');
      return;
    }
    setImageGenerateLoading(true);
    try {
      const res = await dreamService.generateImage(formData.name, formData.description);
      const generatedUrl = res.data?.imageUrl;
      if (generatedUrl) {
        setSelectedImageUrl(generatedUrl);
        setFormData(prev => ({ ...prev, imageUrl: generatedUrl }));
        addToast('AI image generated successfully!', 'success');
      } else {
        addToast('Failed to generate image', 'error');
      }
    } catch (err) {
      let msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to generate image';
      if (typeof msg === 'object') msg = JSON.stringify(msg);
      addToast(msg, 'error');
    } finally {
      setImageGenerateLoading(false);
    }
  };

  const handleImageSelect = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setFormData(prev => ({ ...prev, imageUrl }));
    setImageSearchResults([]);
    addToast('Image selected!', 'success');
  };

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
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      value={manualSearch}
                      onChange={(e) => {
                        const val = e.target.value;
                        setManualSearch(val);
                        if (manualTimer.current) clearTimeout(manualTimer.current);
                        manualTimer.current = setTimeout(() => {
                          if (val.trim()) {
                            handleImageSearch(val.trim());
                          }
                        }, 500);
                      }}
                      placeholder="Search for Dream Image"
                      className="form-input"
                      style={{ fontSize: '14px' }}
                    />
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleImageSearch(null)}
                        disabled={imageSearchLoading || imageGenerateLoading}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: imageSearchLoading || imageGenerateLoading ? '#ccc' : '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: imageSearchLoading || imageGenerateLoading ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {imageSearchLoading ? (
                          <>
                            <div style={{ width: '12px', height: '12px', border: '2px solid #666', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            Searching...
                          </>
                        ) : (
                          <>
                            ✨ Search
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleImageGenerate}
                        disabled={imageSearchLoading || imageGenerateLoading}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: imageSearchLoading || imageGenerateLoading ? '#ccc' : '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: imageSearchLoading || imageGenerateLoading ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {imageGenerateLoading ? (
                          <>
                            <div style={{ width: '12px', height: '12px', border: '2px solid #666', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            Generating...
                          </>
                        ) : (
                          <>
                            🎨 Generate
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg or select from above"
                    className="form-input"
                    style={{ fontSize: '14px' }}
                  />
                  {(formData.imageUrl || selectedImageUrl) && (
                    <div style={{ marginTop: '8px' }}>
                      <img
                        src={formData.imageUrl || selectedImageUrl}
                        alt="Selected"
                        style={{
                          width: '100px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          border: '1px solid #ddd'
                        }}
                      />
                    </div>
                  )}
                  {imageSearchResults.length > 0 && (
                    <div style={{ marginTop: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                      <div style={{ fontSize: '12px', marginBottom: '4px', color: '#666' }}>Select an image:</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '6px' }}>
                        {imageSearchResults.slice(0, 6).map((url, index) => (
                          <div key={index} style={{ position: 'relative', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                            <img
                              src={url}
                              alt={`Option ${index + 1}`}
                              style={{ width: '80px', height: '60px', objectFit: 'cover' }}
                            />
                            <button
                              type="button"
                              onClick={() => handleImageSelect(url)}
                              style={{
                                position: 'absolute',
                                bottom: '2px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                padding: '2px 6px',
                                fontSize: '10px',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                opacity: 0.9
                              }}
                            >
                              Select
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setImageSearchResults([])}
                        style={{
                          marginTop: '4px',
                          padding: '4px 8px',
                          backgroundColor: '#f0f0f0',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
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
