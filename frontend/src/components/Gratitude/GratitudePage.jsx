import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles, CheckCircle } from 'lucide-react';
import { gratitudeService } from '../../services/api';
import { useToast } from '../Shared/ToastContext';
import Navbar from '../Navigation/Navbar';
import Footer from '../Footer/Footer';
import '../../styles/GratitudePage.css';

export default function GratitudePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [gratitude3, setGratitude3] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  useEffect(() => {
    // Check if user already completed gratitude today
    (async () => {
      try {
        const response = await gratitudeService.getTodayStatus();
        if (response.data.completed) {
          setAlreadyCompleted(true);
          if (response.data.data) {
            setGratitude1(response.data.data.gratitude1);
            setGratitude2(response.data.data.gratitude2);
            setGratitude3(response.data.data.gratitude3);
          }
        }
      } catch (err) {
        console.error('Error checking gratitude status:', err);
      }
    })();
  }, []);

  const isAllFilled = gratitude1.trim().length >= 3 && 
                      gratitude2.trim().length >= 3 && 
                      gratitude3.trim().length >= 3;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!isAllFilled) {
      addToast('Please write at least 3 characters for each gratitude entry', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await gratitudeService.submitGratitude({
        gratitude1: gratitude1.trim(),
        gratitude2: gratitude2.trim(),
        gratitude3: gratitude3.trim(),
      });

      if (response.status === 200 || response.status === 204) {
        setSubmitted(true);
        addToast('Gratitude submitted! Your Vision Board is now unlocked ✨', 'success');
        
        // Redirect to dashboard after success animation
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      let errorMessage = err.response?.data?.message || err.message || 'Failed to submit gratitude';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="gratitude-page">
      <Navbar />
      
      <main className="gratitude-main">
        <div className="gratitude-container">
          {/* Back Button */}
          <motion.button
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            onClick={handleBackClick}
            className="gratitude-back-button"
          >
            <ChevronLeft size={18} />
            <span>Return to Dashboard</span>
          </motion.button>

          {/* Main Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="gratitude-card"
          >
            {/* Success State */}
            {submitted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="gratitude-success-overlay"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2 }}
                  className="success-icon"
                >
                  <CheckCircle size={80} />
                </motion.div>
                <h2>Gratitude Recorded!</h2>
                <p>Your vision board is now unlocked for today</p>
              </motion.div>
            )}

            {/* Completed Today Notice (Read-Only) */}
            {alreadyCompleted && !submitted && (
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="completed-notice"
              >
                <CheckCircle size={20} />
                <span>You've already submitted your gratitude today. Come back tomorrow! ✨</span>
              </motion.div>
            )}

            {/* Header */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="gratitude-header"
            >
              <h1 className="gratitude-title">Daily Gratitude Journal</h1>
              <p className="gratitude-subtitle">
                Write 3 things you are grateful for today
              </p>
            </motion.div>

            {/* Form */}
            {!submitted && (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onSubmit={handleSubmit}
                className="gratitude-form"
              >
                {/* Gratitude 1 */}
                <div className="gratitude-field">
                  <label className="gratitude-label">
                    <span className="gratitude-number">1</span>
                  </label>
                  <textarea
                    value={gratitude1}
                    onChange={(e) => setGratitude1(e.target.value)}
                    placeholder="What are you grateful for?"
                    className="gratitude-textarea"
                    disabled={alreadyCompleted || loading}
                    rows="3"
                  />
                  <span className="char-count">
                    {gratitude1.trim().length}/∞
                  </span>
                </div>

                {/* Gratitude 2 */}
                <div className="gratitude-field">
                  <label className="gratitude-label">
                    <span className="gratitude-number">2</span>
                  </label>
                  <textarea
                    value={gratitude2}
                    onChange={(e) => setGratitude2(e.target.value)}
                    placeholder="What else brings you joy?"
                    className="gratitude-textarea"
                    disabled={alreadyCompleted || loading}
                    rows="3"
                  />
                  <span className="char-count">
                    {gratitude2.trim().length}/∞
                  </span>
                </div>

                {/* Gratitude 3*/}
                <div className="gratitude-field">
                  <label className="gratitude-label">
                    <span className="gratitude-number">3</span>
                  </label>
                  <textarea
                    value={gratitude3}
                    onChange={(e) => setGratitude3(e.target.value)}
                    placeholder="What fills your heart with appreciation?"
                    className="gratitude-textarea"
                    disabled={alreadyCompleted || loading}
                    rows="3"
                  />
                  <span className="char-count">
                    {gratitude3.trim().length}/∞
                  </span>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: isAllFilled && !alreadyCompleted ? 1.02 : 1 }}
                  whileTap={{ scale: isAllFilled && !alreadyCompleted ? 0.98 : 1 }}
                  type="submit"
                  disabled={!isAllFilled || alreadyCompleted || loading}
                  className={`gratitude-submit-button ${
                    isAllFilled && !alreadyCompleted ? 'enabled' : 'disabled'
                  }`}
                >
                  {loading ? (
                    <motion.span
                      animate={{ opacity: [0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      Submitting...
                    </motion.span>
                  ) : (
                    <>
                      <span>Submit & Unlock Vision</span>
                      <Sparkles size={18} />
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
