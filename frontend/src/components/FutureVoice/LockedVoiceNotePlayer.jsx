import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Play, Calendar, AlertCircle } from 'lucide-react';

const LockedVoiceNotePlayer = ({
    destinyDate,
    isAchievedEarly: initialAchievedEarly,
    audioUrl,
    onEarlyUnlock
}) => {
    const [isAchievedEarly, setIsAchievedEarly] = useState(initialAchievedEarly);
    const [showConfirmUnlock, setShowConfirmUnlock] = useState(false);

    const destiny = new Date(destinyDate);
    const now = new Date();

    // Is it naturally unlocked?
    const isTimeUnlocked = now >= destiny;
    const isUnlocked = isTimeUnlocked || isAchievedEarly;

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleConfirmUnlock = () => {
        setIsAchievedEarly(true);
        setShowConfirmUnlock(false);
        if (onEarlyUnlock) onEarlyUnlock();
    };

    return (
        <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl p-8">
            <AnimatePresence mode="wait">
                {isUnlocked ? (
                    <motion.div
                        key="unlocked"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="flex items-center gap-3 text-green-600 bg-green-50 px-4 py-2 rounded-full text-sm font-medium">
                            <Unlock size={16} />
                            {isTimeUnlocked ? "The moment has arrived." : "Manifested Early!"}
                        </div>

                        <div className="text-center">
                            <h3 className="text-2xl font-serif text-gray-800 mb-2">Message from the Past</h3>
                            <p className="text-gray-500 text-sm">Recorded for {formatDate(destinyDate)}</p>
                        </div>

                        <div className="w-full max-w-sm mt-2">
                            <audio
                                controls
                                src={audioUrl}
                                className="w-full custom-audio-player"
                            />
                        </div>

                        <p className="italic text-gray-400 text-center text-sm px-4">
                            "Your words from the past were seeds for this very moment."
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="locked"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center text-center gap-6 py-4"
                    >
                        <div className="relative">
                            <motion.div
                                animate={{
                                    scale: [1, 1.05, 1],
                                    rotate: [0, -5, 5, 0]
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center text-amber-400 border border-amber-100 shadow-inner"
                            >
                                <Lock size={40} />
                            </motion.div>
                            <div className="absolute -bottom-2 -right-2 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100 flex items-center gap-1.5 text-[10px] font-bold text-amber-600 uppercase tracking-tighter">
                                <Calendar size={10} />
                                {formatDate(destinyDate)}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-serif text-gray-800">Locked in Time</h3>
                            <p className="text-gray-500 text-sm leading-relaxed max-w-[240px]">
                                This message unlocks on <span className="text-amber-600 font-semibold">{formatDate(destinyDate)}</span>... keep believing ♡
                            </p>
                        </div>

                        <div className="w-full relative h-10 bg-gray-100/50 rounded-xl overflow-hidden blur-[2px] opacity-40">
                            {/* Blurred Waveform Placeholder */}
                            <div className="flex items-center justify-center gap-1 h-full px-4">
                                {[...Array(20)].map((_, i) => (
                                    <div key={i} className="w-1 bg-gray-400 rounded-full" style={{ height: `${20 + Math.random() * 60}%` }} />
                                ))}
                            </div>
                        </div>

                        {!initialAchievedEarly && (
                            <button
                                onClick={() => setShowConfirmUnlock(true)}
                                className="text-xs text-amber-600/60 hover:text-amber-600 font-medium transition-colors"
                            >
                                Did this dream manifest early?
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation Modal Overlay */}
            <AnimatePresence>
                {showConfirmUnlock && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10 bg-white/95 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                                <AlertCircle size={32} />
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-serif text-lg text-gray-800">Has it come true?</h4>
                                <p className="text-sm text-gray-500">Unlocking this message early confirms that your dream has manifested before its destiny date.</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleConfirmUnlock}
                                    className="w-full py-3 bg-amber-500 text-white rounded-2xl font-semibold shadow-lg shadow-amber-100 hover:bg-amber-600 transition-colors"
                                >
                                    Yes, I've achieved it!
                                </button>
                                <button
                                    onClick={() => setShowConfirmUnlock(false)}
                                    className="w-full py-3 text-gray-400 text-sm font-medium"
                                >
                                    Not yet
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LockedVoiceNotePlayer;
