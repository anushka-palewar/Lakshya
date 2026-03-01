import React, { useState, useEffect, useRef } from 'react';
import { Bell, LogOut, ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService, userService } from '../../services/api';
import '../../styles/Navbar.css';

export default function Navbar({ onAddDreamClick, streakDays = 7 }) {
  const [notificationCount, setNotificationCount] = useState(3);
  const [profile, setProfile] = useState({ username: '', email: '' });
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await userService.getProfile();
        setProfile(res.data || {});
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <span className="logo-sankalp">Sankalp</span>
          <span className="logo-ai">AI</span>
        </div>

        {/* Right Section */}
        <div className="navbar-right">
          {/* Streak Badge */}
          <div className="streak-badge">
            <span className="streak-fire">🔥</span>
            <span className="streak-text">{streakDays}-day streak</span>
          </div>

          {/* Notification Icon */}
          <button className="btn-icon notification-btn">
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="notification-dot">{notificationCount}</span>
            )}
          </button>

          {/* Profile Avatar */}
          <div className="profile-menu" ref={menuRef}>
            <button className="profile-avatar" onClick={() => setOpenMenu((s) => !s)}>
              <div className="avatar-initial">{(profile.username && profile.username.charAt(0).toUpperCase()) || 'U'}</div>
            </button>
            {openMenu && (
              <div className="profile-dropdown">
                <div className="profile-info">
                  <strong>{profile.username || 'User'}</strong>
                  <div className="profile-email">{profile.email || '—'}</div>
                </div>
                <div className="profile-actions">
                  <button className="btn-ghost" onClick={handleLogout} title="Logout">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Back button (visible when not on dashboard) */}
          {location.pathname !== '/dashboard' && (
            <button className="btn-ghost back-btn" onClick={() => navigate(-1)} title="Back">
              <ChevronLeft size={18} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
