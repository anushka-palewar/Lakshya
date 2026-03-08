import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Download, Zap } from 'lucide-react';
import html2canvas from 'html2canvas';
import { dreamService } from '../../services/api';
import VisionBoardCollage from './VisionBoardCollage';
import VisionBoardGrid from './VisionBoardGrid';
import VisionBoardVisualizer from './VisionBoardVisualizer';
import { useToast } from '../Shared/ToastContext';
import '../../styles/VisionBoard.css';

export default function VisionBoardPage() {
  const [visionBoard, setVisionBoard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [visualizerOpen, setVisualizerOpen] = useState(false);
  const [boardRef, setBoardRef] = useState(null);
  const { addToast } = useToast();

  // Fetch vision board on mount
  useEffect(() => {
    fetchVisionBoard();
  }, []);

  const fetchVisionBoard = async (selectedMode = 'collage', forceRegenerate = false) => {
    setLoading(true);
    setError('');
    try {
      const response = await dreamService.generateVisionBoard(selectedMode, forceRegenerate);
      setVisionBoard(response.data);
    } catch (err) {
      console.error('Vision Board Error:', err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to generate vision board';
      setError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateBoard = async () => {
    if (visionBoard) {
      await fetchVisionBoard(visionBoard.mode, true);
      addToast('Vision board regenerated!', 'success');
    }
  };

  const handleDownloadBoard = async () => {
    if (!visionBoard?.boardImageUrl) {
      addToast('Vision board not ready for download', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(visionBoard.boardImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vision-board-${visionBoard.mode}-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      addToast('Vision board downloaded!', 'success');
    } catch (err) {
      console.error('Download error:', err);
      addToast('Failed to download vision board', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartVisualization = () => {
    if (!visionBoard) {
      addToast('Vision board not ready', 'error');
      return;
    }
    setVisualizerOpen(true);
  };

  if (loading && !visionBoard) {
    return (
      <div className="vision-board-page">
        <div className="vision-board-container">
          <motion.div
            className="vision-board-loading"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="spinner"></div>
            <p>Generating your {visionBoard?.mode === 'ai' ? 'AI' : ''} Vision Board...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="vision-board-page">
      <motion.div
        className="vision-board-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="vision-board-header">
          <h1>Your Vision Board</h1>
          <p className="vision-board-subtitle">
            Visualize your dreams. Manifest your reality.
          </p>
          {!visionBoard && !loading && !error && (
            <p className="vision-board-initial-msg">Generate your vision board to visualize your dreams.</p>
          )}
        </div>

        {/* Mode Selection (if no board) */}
        {!visionBoard && !loading && (
          <div className="vision-board-options">
            <div className="option-card" onClick={() => fetchVisionBoard('collage')}>
              <div className="option-icon">🎨</div>
              <h3>Collage Vision Board</h3>
              <p>Create a beautiful collage of your dream images using Cloudinary transformations.</p>
              <button className="btn-primary">Generate Collage</button>
            </div>
            <div className="option-card" onClick={() => fetchVisionBoard('ai')}>
              <div className="option-icon">✨</div>
              <h3>AI Vision Board</h3>
              <p>Generate a single inspirational image combining all your dreams using AI.</p>
              <button className="btn-primary">Generate AI Board</button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            className="error-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p>{error}</p>
            <div className="error-actions">
              <button onClick={() => setError('')} className="btn-text">Try Again</button>
              <button onClick={() => window.location.href = '/dreams'} className="btn-primary">Go to Dreams</button>
            </div>
          </motion.div>
        )}

        {/* Board Display */}
        {visionBoard && !error && (
          <motion.div
            className="vision-board-wrapper"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="vision-board-display" id="vision-board-capture">
              {visionBoard.mode === 'ai' ? (
                <div className="ai-board-container">
                  <img
                    src={visionBoard.boardImageUrl}
                    alt="AI Vision Board"
                    className="vision-board-image"
                    onLoad={() => setLoading(false)}
                  />
                  <div className="vision-board-overlay-text">
                    <h2>AI VISION</h2>
                    <p>MANIFESTED FROM YOUR DREAMS</p>
                  </div>
                </div>
              ) : (
                <div className="collage-grid-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <VisionBoardGrid dreams={visionBoard.dreams || []} />
                  <div className="vision-board-overlay-text">
                    <h2>MY FUTURE</h2>
                    <p>MANIFESTED FROM YOUR DREAMS</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Inspirational Message */}
        {visionBoard && (
          <motion.div
            className="inspirational-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <p>{visionBoard.inspirationalMessage}</p>
          </motion.div>
        )}

        {/* Controls */}
        {visionBoard && (
          <motion.div
            className="vision-board-controls"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <button
              className="control-btn visualize-btn"
              onClick={handleStartVisualization}
              disabled={loading}
            >
              <Zap size={18} />
              Start 60 Second Visualization
            </button>

            <button
              className="control-btn download-btn"
              onClick={handleDownloadBoard}
              disabled={loading || !visionBoard}
            >
              <Download size={18} />
              Download Vision Board
            </button>

            <button
              className="control-btn regenerate-btn"
              onClick={() => setVisionBoard(null)}
              disabled={loading}
            >
              <RefreshCw size={18} />
              Choose Different Mode
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Visualization Modal */}
      <AnimatePresence>
        {visualizerOpen && (
          <VisionBoardVisualizer
            visionBoard={visionBoard}
            onClose={() => setVisualizerOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
