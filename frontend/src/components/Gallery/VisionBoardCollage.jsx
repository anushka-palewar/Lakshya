import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../../styles/VisionBoardCollage.css';

export default function VisionBoardCollage({ visionBoard, onCanvasReady }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && canvasRef.current) {
      onCanvasReady(containerRef.current);
    }
  }, [onCanvasReady, visionBoard]);

  const renderLayout = () => {
    const dreams = visionBoard.dreams || [];
    const layout = visionBoard.layout;

    const dreamItems = dreams.map((dream, idx) => (
      <motion.div
        key={dream.dreamId}
        className={`vision-dream-card vision-dream-${idx}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: idx * 0.1, duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="vision-dream-image-wrapper">
          <img
            src={dream.imageUrl}
            alt={dream.dreamTitle}
            className="vision-dream-image"
          />
          <div className="vision-dream-overlay">
            <h3 className="vision-dream-title">{dream.dreamTitle}</h3>
            {dream.dreamDescription && (
              <p className="vision-dream-description">{dream.dreamDescription}</p>
            )}
          </div>
        </div>
      </motion.div>
    ));

    return (
      <div ref={containerRef} className={`vision-collage vision-collage-${layout}`}>
        <div className="vision-collage-gradient-overlay">
          <div className="vision-collage-text-overlay">
            <h2 className="vision-board-title">MY FUTURE</h2>
            <p className="vision-board-subtitle-overlay">MY VISION • MY REALITY</p>
          </div>
        </div>
        <div className={`vision-grid vision-grid-${layout}`}>
          {dreamItems}
        </div>
      </div>
    );
  };

  return renderLayout();
}
