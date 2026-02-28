import { useState, useEffect } from 'react';
import api from '../../services/api';
import './DreamBoard.css';

const DreamBoard = () => {
    const [dreams, setDreams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        imageUrl: '',
        dueDate: '',
        isAchieved: false
    });

    useEffect(() => {
        fetchDreams();
    }, []);

    const fetchDreams = async () => {
        try {
            const response = await api.get('/dreams');
            setDreams(response.data);
        } catch (err) {
            setError('Could not load your dreams.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/dreams', formData);
            setShowModal(false);
            setFormData({ name: '', description: '', imageUrl: '', dueDate: '', isAchieved: false });
            fetchDreams();
        } catch (err) {
            setError('Failed to save dream.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this dream?')) {
            try {
                await api.delete(`/dreams/${id}`);
                fetchDreams();
            } catch (err) {
                setError('Failed to delete dream.');
            }
        }
    };

    const toggleAchieved = async (dream) => {
        try {
            await api.put(`/dreams/${dream.id}`, {
                ...dream,
                isAchieved: !dream.isAchieved
            });
            fetchDreams();
        } catch (err) {
            setError('Failed to update dream status.');
        }
    };

    return (
        <div className="dream-board">
            <header className="board-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h1 style={{ margin: 0 }}>Your Vision Board</h1>
                    <span style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: 'var(--primary-color)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 600
                    }}>
                        {dreams.length} {dreams.length === 1 ? 'Dream' : 'Dreams'} Tracked
                    </span>
                </div>
                <button className="btn-add" onClick={() => setShowModal(true)}>+</button>
            </header>

            {error && <div className="error-message">{error}</div>}

            <div className="dream-grid">
                {dreams.map((dream) => (
                    <div key={dream.id} className={`dream-tile ${dream.isAchieved ? 'achieved' : ''}`} style={{
                        opacity: dream.isAchieved ? 0.8 : 1,
                        transition: 'all 0.3s ease'
                    }}>
                        {dream.imageUrl && (
                            <div className="dream-img-container">
                                <img src={dream.imageUrl} alt={dream.name} className="dream-img" />
                                {dream.isAchieved && (
                                    <div className="achieved-overlay">
                                        <span>✓ ACHIEVED</span>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="dream-content">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ margin: 0, textDecoration: dream.isAchieved ? 'line-through' : 'none' }}>{dream.name}</h3>
                                <input
                                    type="checkbox"
                                    checked={dream.isAchieved}
                                    onChange={() => toggleAchieved(dream)}
                                    title="Mark as achieved"
                                />
                            </div>
                            <p style={{ minHeight: '3rem' }}>{dream.description}</p>

                            <div className="dream-footer" style={{
                                marginTop: 'auto',
                                paddingTop: '1rem',
                                borderTop: '1px solid var(--glass-border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.8rem'
                            }}>
                                <div style={{ color: 'var(--text-secondary)' }}>
                                    Target: {dream.dueDate ? new Date(dream.dueDate).toLocaleDateString() : 'No date'}
                                </div>
                                <button onClick={() => handleDelete(dream.id)} className="btn-action delete" style={{ padding: '0.25rem 0.5rem' }}>Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
                {dreams.length === 0 && !loading && (
                    <div className="empty-state" style={{
                        gridColumn: '1 / -1',
                        padding: '5rem',
                        textAlign: 'center',
                        background: 'var(--glass-bg)',
                        borderRadius: '24px',
                        border: '1px dashed var(--glass-border)'
                    }}>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Your vision board is empty. Start adding your dreams!</p>
                        <button className="btn-primary" style={{ width: 'auto', marginTop: '1rem' }} onClick={() => setShowModal(true)}>Add My First Dream</button>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="modal-content auth-container" style={{ width: '100%', maxWidth: '500px', margin: '2rem' }}>
                        <h2 style={{ marginBottom: '0.5rem' }}>Manifest New Dream</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Fill in the details to add this to your board.</p>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label>What's the Dream?</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Visit Northern Lights"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description (Your Why)</label>
                                <textarea
                                    placeholder="Describe why this matters and how you'll get there..."
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Image URL (Vision)</label>
                                <input
                                    type="url"
                                    placeholder="https://images.unsplash.com/your-vision"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Due Date</label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Already Achieved?</label>
                                    <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: '0.5rem' }}>
                                        <input
                                            type="checkbox"
                                            style={{ width: 'auto', marginBottom: 0 }}
                                            checked={formData.isAchieved}
                                            onChange={(e) => setFormData({ ...formData, isAchieved: e.target.checked })}
                                        />
                                        <span>Yes</span>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-btns" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn-logout" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 2 }}>Save Dream</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DreamBoard;
