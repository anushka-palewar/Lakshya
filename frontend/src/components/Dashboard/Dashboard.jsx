import React, { useState, useEffect } from 'react';
import Navbar from '../Navigation/Navbar';
import HeroSection from '../Home/HeroSection';
import DreamStream from '../Home/DreamStream';
import ActionHub from '../Home/ActionHub';
import ManifestationTimer from '../Timer/ManifestationTimer';
import Footer from '../Footer/Footer';
import AddDreamModal from '../Modal/AddDreamModal';
import '../../styles/Dashboard.css';
import { useNavigate } from 'react-router-dom';
import { userService, dreamService, gratitudeService } from '../../services/api';
import { useToast } from '../Shared/ToastContext';
import { Plus } from 'lucide-react';

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [streakDays, setStreakDays] = useState(0);
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gratitudeCompletedToday, setGratitudeCompletedToday] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [sRes, dRes, gRes] = await Promise.all([
          userService.getStreak(), 
          dreamService.getDreams(),
          gratitudeService.getTodayStatus()
        ]);
        setStreakDays(sRes.data?.currentStreak || 0);
        setDreams(dRes.data || []);
        setGratitudeCompletedToday(gRes.data?.completed || false);
      } catch (err) {
        let msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to load dashboard data';
        if (typeof msg === 'object') msg = JSON.stringify(msg);
        addToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAddDreamClick = () => {
    setIsModalOpen(true);
  };

  const handleManifestationStart = () => {
    navigate('/manifestation');
  };

  const onDreamAdded = async () => {
    try {
      const res = await dreamService.getDreams();
      setDreams(res.data || []);
      addToast('Dream added', 'success');
    } catch (err) {
      addToast('Failed to refresh dreams', 'error');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="dashboard">
      {/* Navbar */}
    <Navbar onAddDreamClick={handleAddDreamClick} streakDays={streakDays} />

      {/* Quick Add Button */}
      <button
        onClick={() => navigate('/dreams/new')}
        title="Create new dream"
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          zIndex: 1200,
          backgroundColor: '#4f46e5',
          color: 'white',
          border: 'none',
          padding: '12px 16px',
          borderRadius: '12px',
          boxShadow: '0 6px 18px rgba(79,70,229,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer'
        }}
      >
        <Plus size={16} />
        New Dream
      </button>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Hero Section */}
        <HeroSection 
          onCtaClick={handleManifestationStart} 
          gratitudeCompletedToday={gratitudeCompletedToday}
        />

        {/* Dream Stream Section */}
        <DreamStream dreams={dreams} loading={loading} />

        {/* Action Hub Section */}
        <ActionHub onAddDreamClick={handleAddDreamClick} />

        {/* Manifestation Timer Section */}
        <ManifestationTimer />

        {/* Footer */}
        <Footer />
      </main>

      {/* Add Dream Modal */}
      <AddDreamModal isOpen={isModalOpen} onClose={handleCloseModal} onAdded={onDreamAdded} />
    </div>
  );
}

