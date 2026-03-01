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
import { userService, dreamService } from '../../services/api';
import { useToast } from '../Shared/ToastContext';

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [streakDays, setStreakDays] = useState(0);
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [sRes, dRes] = await Promise.all([userService.getStreak(), dreamService.getDreams()]);
        setStreakDays(sRes.data?.currentStreak || 0);
        setDreams(dRes.data || []);
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

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Hero Section */}
        <HeroSection onCtaClick={handleManifestationStart} />

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

