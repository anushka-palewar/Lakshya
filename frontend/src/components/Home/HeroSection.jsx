import React from 'react';
import { motion } from 'framer-motion';
import '../../styles/HeroSection.css';

export default function HeroSection({ onCtaClick }) {
  return (
    <section className="hero-section">
      <div className="hero-background">
        <div className="hero-glow-circle"></div>
      </div>

      <div className="hero-content">
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-heading-wrapper"
        >
          <h1 className="hero-heading">
            <span className="hero-line">Design Your</span>
            <span className="hero-line hero-destiny">Destiny</span>
          </h1>
        </motion.div>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hero-subheading"
        >
          The bridge between your imagination and reality.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="hero-buttons"
        >
          <button className="btn-primary btn-hero-primary" onClick={onCtaClick}>
            Start Your Morning Manifestation ✨
          </button>
          <button className="btn-secondary btn-hero-secondary">
            Explore Dream Stream
          </button>
        </motion.div>
      </div>
    </section>
  );
}
