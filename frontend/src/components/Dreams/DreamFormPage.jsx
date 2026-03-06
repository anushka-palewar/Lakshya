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
  const [imageSearchResults, setImageSearchResults] = useState([]);
  const [imageSearchLoading, setImageSearchLoading] = useState(false);
  const [imageGenerateLoading, setImageGenerateLoading] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [manualSearch, setManualSearch] = useState('');
  const manualTimer = React.useRef(null);
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

  const handleImageSearch = async (customQuery) => {
    if (!customQuery && !formData.name.trim() && !formData.description.trim()) {
      addToast('Please enter a dream name or description first', 'error');
      return;
    }
    setImageSearchLoading(true);
    setImageSearchResults([]);
    try {
      const title = formData.name;
      const description = formData.description;
      const category = formData.category;
      const res = await dreamService.searchImages(title, description, category, customQuery || null);
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
            <label className="form-label">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="form-textarea" rows={4} />
          </div>

          {/* Dream Image Section */}
          <div className="form-group">
            <label className="form-label">Dream Image</label>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
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
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleImageSearch(null)}
                    disabled={imageSearchLoading || imageGenerateLoading}
                    className="btn-secondary"
                    style={{
                      opacity: imageSearchLoading || imageGenerateLoading ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {imageSearchLoading ? (
                      <>
                        <div style={{ width: '16px', height: '16px', border: '2px solid #666', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        Searching...
                      </>
                    ) : (
                      <>
                        ✨ Search Dream Images
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleImageGenerate}
                    disabled={imageSearchLoading || imageGenerateLoading}
                    className="btn-secondary"
                    style={{
                      opacity: imageSearchLoading || imageGenerateLoading ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {imageGenerateLoading ? (
                      <>
                        <div style={{ width: '16px', height: '16px', border: '2px solid #666', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        Generating...
                      </>
                    ) : (
                      <>
                        🎨 Generate Dream Image
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Manual URL input */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: '#666' }}>
                  Or paste image URL manually:
                </label>
                <input
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="form-input"
                  style={{ fontSize: '14px' }}
                />
              </div>

              {/* Image Preview */}
              {(formData.imageUrl || selectedImageUrl) && (
                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#666' }}>
                    Preview:
                  </label>
                  <div
                    style={{
                      width: '200px',
                      height: '120px',
                      backgroundImage: `url(${formData.imageUrl || selectedImageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: '8px',
                      border: '2px solid #e0e0e0'
                    }}
                  />
                </div>
              )}

              {/* Search Results */}
              {imageSearchResults.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#666' }}>
                    Select an image:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
                    {imageSearchResults.slice(0,6).map((url, index) => (
                      <div key={index} style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                        <img
                          src={url}
                          alt={`Result ${index + 1}`}
                          style={{ width: '120px', height: '80px', objectFit: 'cover' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleImageSelect(url)}
                          style={{
                            position: 'absolute',
                            bottom: '4px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            padding: '4px 8px',
                            fontSize: '11px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
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
                      marginTop: '8px',
                      padding: '6px 12px',
                      backgroundColor: '#f0f0f0',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Clear results
                  </button>
                </div>
              )}
            </div>
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
