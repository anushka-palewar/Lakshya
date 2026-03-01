import React, { useState } from 'react';
import Navbar from './Navigation/Navbar';
import HeroSection from './Home/HeroSection';
import DreamStream from './Home/DreamStream';
import ActionHub from './Home/ActionHub';
import ManifestationTimer from './Timer/ManifestationTimer';
import Footer from './Footer/Footer';
import AddDreamModal from './Modal/AddDreamModal';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddDreamClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="dashboard">
      {/* Navbar */}
      <Navbar onAddDreamClick={handleAddDreamClick} streakDays={7} />

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Hero Section */}
        <HeroSection onCtaClick={handleAddDreamClick} />

        {/* Dream Stream Section */}
        <DreamStream />

        {/* Action Hub Section */}
        <ActionHub onAddDreamClick={handleAddDreamClick} />

        {/* Manifestation Timer Section */}
        <ManifestationTimer />

        {/* Footer */}
        <Footer />
      </main>

      {/* Add Dream Modal */}
      <AddDreamModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}
