import React from 'react';
import { motion } from 'framer-motion';
import '../../styles/VisionBoardGrid.css';

const VisionBoardGrid = ({ dreams }) => {
    const dreamImages = (dreams || [])
        .filter(d => d.imageUrl)
        .slice(0, 6);

    if (dreamImages.length === 0) {
        return (
            <div className="vision-board-empty">
                <p>No dream images found. Add dream images to generate your vision board.</p>
            </div>
        );
    }

    const getLayoutClass = (count) => {
        if (count === 1) return 'layout-1';
        if (count === 2) return 'layout-2';
        if (count === 3) return 'layout-3';
        if (count === 4) return 'layout-4';
        return 'layout-collage';
    };

    const layoutClass = getLayoutClass(dreamImages.length);

    return (
        <div className={`vision-board-grid ${layoutClass}`}>
            {dreamImages.map((dream, index) => (
                <motion.div
                    key={dream.dreamId || index}
                    className="vision-board-tile"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                    <img
                        src={dream.imageUrl}
                        alt={dream.dreamTitle}
                        className="vision-board-tile-img"
                        loading="lazy"
                    />
                    <div className="tile-overlay">
                        <span>{dream.dreamTitle}</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default VisionBoardGrid;
