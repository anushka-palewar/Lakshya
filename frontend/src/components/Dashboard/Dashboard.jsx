import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from '../../services/api';
import api from '../../services/api';
import '../Dashboard/DreamBoard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        imageUrl: '',
        dueDate: '',
        isAchieved: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0, hasLoggedInToday: false });

    useEffect(() => {
        const fetchStreak = async () => {
            try {
                const response = await api.get('/user/streak');
                setStreak(response.data);
            } catch (err) {
                console.error('Failed to fetch streak', err);
            }
        };
        fetchStreak();
    }, []);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/dreams', formData);
            setShowModal(false);
            setFormData({ name: '', description: '', imageUrl: '', dueDate: '', isAchieved: false });
            // Optionally redirect to dreams board to see the new dream
            navigate('/dreams');
        } catch (err) {
            setError('Failed to save dream.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard">
            <nav className="navbar">
                <div className="logo-group">
                    <h2>DreamWeb <span style={{ color: 'var(--primary-color)' }}>Panel</span></h2>
                </div>
                <div className="user-profile">
                    <button
                        className="btn-add"
                        onClick={() => setShowModal(true)}
                        style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}
                        title="Add New Dream"
                    >+</button>
                    <div className="user-info" style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="streak-badge" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '20px',
                            border: '1px solid var(--glass-border)'
                        }}>
                            <span style={{
                                color: streak.hasLoggedInToday ? '#ff9800' : '#94a3b8',
                                fontSize: '1.2rem',
                                filter: streak.hasLoggedInToday ? 'drop-shadow(0 0 5px rgba(255, 152, 0, 0.4))' : 'none'
                            }}>🔥</span>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{streak.currentStreak}</span>
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user || 'User'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Member</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                </div>
            </nav>

            <div className="welcome-banner" style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
                padding: '3rem',
                borderRadius: '32px',
                marginBottom: '2rem',
                border: '1px solid var(--glass-border)',
                backdropFilter: 'blur(8px)'
            }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Hello, {user?.split('@')[0] || 'Explorer'}!</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', marginBottom: '1.5rem' }}>
                    Welcome to your personal DreamWeb dashboard. All your activities and project stats will appear here. The functionalities completed til now include Auth & JWT Security.
                </p>
                <Link to="/dreams" className="btn-primary" style={{ display: 'inline-block', width: 'auto', padding: '1rem 2rem', textDecoration: 'none' }}>Open Vision Board</Link>
            </div>

            <div className="card-grid">
                <div className="stat-card">
                    <h3>Total Projects</h3>
                    <p>12</p>
                    <div style={{ marginTop: '1rem', color: 'var(--success-color)', fontSize: '0.8rem' }}>+2.5% vs last month</div>
                </div>
                <div className="stat-card">
                    <h3>Active Sessions</h3>
                    <p>1</p>
                    <div style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>System active now</div>
                </div>
                <div className="stat-card">
                    <h3>Security Level</h3>
                    <p>Highest</p>
                    <div style={{ marginTop: '1rem', color: 'var(--primary-color)', fontSize: '0.8rem' }}>JWT Encrypted</div>
                </div>
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
                        <h2 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Manifest New Dream</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>Fill in the details to add this to your board.</p>
                        {error && <div className="error-message">{error}</div>}
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
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        background: 'rgba(15, 23, 42, 0.5)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '12px',
                                        color: 'white',
                                        fontFamily: 'inherit'
                                    }}
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
                                        style={{ width: '100%', padding: '1rem', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white' }}
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Already Achieved?</label>
                                    <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: '0.5rem', paddingLeft: '0.5rem' }}>
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
                                <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={loading}>
                                    {loading ? 'Manifesting...' : 'Save Dream'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
