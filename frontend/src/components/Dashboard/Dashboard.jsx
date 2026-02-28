import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';

const Dashboard = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div className="dashboard">
            <nav className="navbar">
                <div className="logo-group">
                    <h2>DreamWeb <span style={{ color: 'var(--primary-color)' }}>Panel</span></h2>
                </div>
                <div className="user-profile">
                    <div className="user-info" style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user || 'User'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Member</div>
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
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px' }}>
                    Welcome to your personal DreamWeb dashboard. All your activities and project stats will appear here. The functionalities completed til now include Auth & JWT Security.
                </p>
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
        </div>
    );
};

export default Dashboard;
