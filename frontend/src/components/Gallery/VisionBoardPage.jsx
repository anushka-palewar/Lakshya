import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Download, Zap } from 'lucide-react';
import html2canvas from 'html2canvas';
import { dreamService } from '../../services/api';
import VisionBoardCollage from './VisionBoardCollage';
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

  const fetchVisionBoard = async (forceRegenerate = false) => {
    setLoading(true);
    setError('');
    try {
      const response = await dreamService.generateVisionBoard(forceRegenerate);
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
    await fetchVisionBoard(true);
    addToast('Vision board regenerated!', 'success');
  };

  const handleDownloadBoard = async () => {
    if (!boardRef) {
      addToast('Vision board not ready for download', 'error');
      return;
    }

    try {
      setLoading(true);
      const canvas = await html2canvas(boardRef, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#16213e',
        scale: 2 // High quality
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `vision-board-${new Date().toISOString().split('T')[0]}.png`;
      link.click();
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
      <div className="vision-board-container">
        <motion.div
          className="vision-board-loading"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="spinner"></div>
          <p>Generating your Vision Board...</p>
        </motion.div>
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
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="error-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p>{error}</p>
          </motion.div>
        )}

        {/* Collage */}
        {visionBoard && !error && (
          <motion.div
            className="vision-board-wrapper"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <VisionBoardCollage
              visionBoard={visionBoard}
              onCanvasReady={setBoardRef}
            />
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
            onClick={handleRegenerateBoard}
            disabled={loading}
          >
            <RefreshCw size={18} />
            Regenerate Board
          </button>
        </motion.div>
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
