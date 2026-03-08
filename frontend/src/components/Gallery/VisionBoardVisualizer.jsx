import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import '../../styles/VisionBoardVisualizer.css';

export default function VisionBoardVisualizer({ visionBoard, onClose }) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleClose = () => {
    setIsRunning(false);
    onClose();
  };

  const motivationalMessages = [
    "You are becoming the person who achieves these dreams.",
    "Every vision brings you closer to your destiny.",
    "Feel the energy of your achievements.",
    "Your future is crystal clear. Step into it.",
    "These dreams are already part of your reality.",
    "You have the power to manifest this vision.",
    "Breathe in your success. Exhale your doubts.",
    "Your dreams are calling. Answer them.",
    "Your future is forming with every action you take.",
    "Believe in the power of your vision.",
  ];

  const currentMessage = React.useMemo(() =>
    motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
    , []);

  return (
    <AnimatePresence>
      <motion.div
        className="visualizer-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Close Button */}
        <button className="visualizer-close-btn" onClick={handleClose}>
          <X size={28} />
        </button>

        {/* Dream Image with Zoom Animation */}
        <div className="visualizer-container">
          <motion.div
            className="visualizer-main-image-wrapper"
            initial={{ scale: 1 }}
            animate={{
              scale: 1.1,
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: "linear"
            }}
          >
            <img
              src={visionBoard.boardImageUrl}
              alt="Vision Board"
              className="visualizer-main-image"
            />
          </motion.div>

          {/* Gradient Overlay Background */}
          <div className="visualizer-gradient-bg"></div>

          {/* Center Content */}
          <motion.div
            className="visualizer-center-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2
              className="visualizer-title"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              MY VISION
            </motion.h2>

            <motion.p
              className="visualizer-message"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            >
              {currentMessage}
            </motion.p>

            {/* Timer */}
            <motion.div
              className="visualizer-timer"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <div className="timer-display">{timeLeft}s</div>
              <div className="timer-progress">
                <motion.div
                  className="timer-bar"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 60) * 100}%` }}
                  transition={{ duration: 0.3 }}
                ></motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Meditation Guide */}
          {timeLeft > 45 && (
            <motion.p className="meditation-guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              Take a deep breath. Feel your dreams becoming real.
            </motion.p>
          )}

          {timeLeft <= 45 && timeLeft > 30 && (
            <motion.p className="meditation-guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              Visualize yourself living these dreams. See every detail.
            </motion.p>
          )}

          {timeLeft <= 30 && timeLeft > 15 && (
            <motion.p className="meditation-guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              Feel the emotions. Gratitude. Excitement. Determination.
            </motion.p>
          )}

          {timeLeft <= 15 && timeLeft > 0 && (
            <motion.p className="meditation-guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              You are ready. These dreams are yours. Go achieve them.
            </motion.p>
          )}

          {timeLeft === 0 && (
            <motion.p
              className="meditation-complete"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              ✨ You've completed your visualization. Go make it real! ✨
            </motion.p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
