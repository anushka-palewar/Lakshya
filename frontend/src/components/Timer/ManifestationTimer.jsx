import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import '../../styles/ManifestationTimer.css';

export default function ManifestationTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [seconds, setSeconds] = useState(5 * 60); // 5 minutes default
  const totalSeconds = 5 * 60;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (seconds / totalSeconds) * circumference;

  useEffect(() => {
    let interval;
    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins}:${remSecs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (seconds > 0) {
      setIsRunning(!isRunning);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(totalSeconds);
  };

  return (
    <section className="section manifestation-timer-section">
      <div className="container-max timer-center">
        {/* Title */}
        <h2 className="section-title">Manifestation Timer</h2>
        <p className="section-subtitle">A moment of calm focus and intention setting</p>

        {/* Timer Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="timer-wrapper"
        >
          {/* Circular Progress */}
          <svg className="timer-circle" viewBox="0 0 300 300">
            {/* Background Circle */}
            <circle cx="150" cy="150" r="90" className="timer-circle-bg"></circle>

            {/* Progress Ring */}
            <circle
              cx="150"
              cy="150"
              r="90"
              className="timer-circle-progress"
              style={{ strokeDashoffset }}
            ></circle>
          </svg>

          {/* Timer Display */}
          <div className="timer-display">
            <div className="timer-time">{formatTime(seconds)}</div>
            <div className="timer-label">Golden Minutes</div>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="timer-controls">
          {/* Play/Pause Button */}
          <button
            className="timer-btn timer-btn-main"
            onClick={handlePlayPause}
            disabled={seconds === 0}
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} />}
          </button>

          {/* Reset Button */}
          <button className="timer-btn" onClick={handleReset}>
            Reset
          </button>

          {/* Sound Toggle */}
          <button
            className={`timer-btn ${soundEnabled ? 'sound-enabled' : 'sound-disabled'}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>

        {/* Ambient Message */}
        <p className="timer-message">
          {isRunning
            ? 'Focus on your intentions... Breathe deeply.'
            : 'Start your manifestation practice now'}
        </p>
      </div>
    </section>
  );
}
