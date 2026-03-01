import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/api';
import { useToast } from '../Shared/ToastContext';
import '../../styles/ManifestationTimer.css';

export default function ManifestationPage() {
  const [seconds, setSeconds] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    let interval;
    if (isRunning && seconds > 0) {
      interval = setInterval(() => setSeconds((s) => s - 1), 1000);
    }
    if (seconds === 0 && isRunning) {
      // complete
      setIsRunning(false);
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  const handleStartPause = () => {
    if (seconds > 0) setIsRunning((r) => !r);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(60);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handleComplete = async () => {
    setLoading(true);
    try {
      await userService.updateStreak();
      addToast('Streak updated', 'success');
    } catch (err) {
        let msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to update streak';
      if (typeof msg === 'object') msg = JSON.stringify(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
      navigate('/dashboard');
    }
  };

  const circumference = 2 * Math.PI * 90;
  const totalSeconds = 60;
  const strokeDashoffset = circumference - (seconds / totalSeconds) * circumference;

  return (
    <section className="section manifestation-timer-section">
      <div className="container-max timer-center">
        <h2 className="section-title">Morning Manifestation</h2>
        <p className="section-subtitle">A focused 60s manifestation to set your day.</p>

        <div className="timer-wrapper">
          <svg className="timer-circle" viewBox="0 0 300 300">
            <circle cx="150" cy="150" r="90" className="timer-circle-bg"></circle>
            <circle cx="150" cy="150" r="90" className="timer-circle-progress" style={{ strokeDashoffset }}></circle>
          </svg>

          <div className="timer-display">
            <div className="timer-time">{formatTime(seconds)}</div>
            <div className="timer-label">Morning Minute</div>
          </div>
        </div>

        <div className="timer-controls">
          <button className="timer-btn timer-btn-main" onClick={handleStartPause} disabled={loading}>
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button className="timer-btn" onClick={handleReset} disabled={loading}>Reset</button>
        </div>

        {loading && <p>Updating streak...</p>}
      </div>
    </section>
  );
}
