import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wind, Sparkles, Volume2, VolumeX } from 'lucide-react';

const FocusMode = ({ dream, onClose }) => {
    const [secondsLeft, setSecondsLeft] = useState(60);
    const [phase, setPhase] = useState('inhale'); // inhale, hold, exhale
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        if (secondsLeft <= 0) {
            onClose();
            return;
        }

        const timer = setInterval(() => {
            setSecondsLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [secondsLeft, onClose]);

    useEffect(() => {
        const breathingCycle = setInterval(() => {
            setPhase((p) => {
                if (p === 'inhale') return 'exhale';
                return 'inhale';
            });
        }, 4000);
        return () => clearInterval(breathingCycle);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F8F6F2] overflow-hidden"
        >
            {/* Shifting Gradient Background */}
            <motion.div
                animate={{
                    background: phase === 'inhale'
                        ? 'radial-gradient(circle at center, rgba(212,160,23,0.08) 0%, rgba(248,246,242,1) 100%)'
                        : 'radial-gradient(circle at center, rgba(212,160,23,0.03) 0%, rgba(248,246,242,1) 100%)'
                }}
                className="absolute inset-0 -z-10"
            />

            {/* Top Navigation */}
            <div className="absolute top-12 left-0 right-0 px-12 flex justify-between items-center group">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border border-zen-gold/20 rounded-full flex items-center justify-center text-zen-gold">
                        <Sparkles size={18} className="animate-pulse" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-charcoal/40">Visual Frequency</p>
                        <p className="text-xs font-bold text-charcoal">432Hz Alignment</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-4 rounded-full bg-white border border-charcoal/5 text-charcoal/40 hover:text-zen-gold transition-all"
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-4 rounded-full bg-white border border-charcoal/5 text-charcoal/40 hover:text-rose-500 hover:rotate-90 transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            <div className="max-w-6xl w-full flex flex-col items-center gap-20 px-10">
                {/* Central Dream Visual */}
                <motion.div
                    animate={{
                        scale: phase === 'inhale' ? 1.05 : 0.98,
                        boxShadow: phase === 'inhale'
                            ? "0 40px 100px rgba(212,160,23,0.15)"
                            : "0 20px 50px rgba(0,0,0,0.05)"
                    }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    className="relative w-[400px] h-[550px] rounded-[60px] overflow-hidden border-8 border-white shadow-2xl"
                >
                    <motion.img
                        src={dream.imageUrl}
                        alt={dream.name}
                        className="w-full h-full object-cover"
                        animate={{ scale: [1, 1.1] }}
                        transition={{ duration: 60, ease: "linear" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            animate={{ opacity: [0.2, 0.5, 0.2] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="w-full h-full bg-zen-gold/10 mix-blend-overlay"
                        />
                    </div>
                </motion.div>

                {/* Content & Breathing Grid */}
                <div className="text-center max-w-2xl">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="heading-serif text-6xl text-charcoal mb-6 leading-tight"
                    >
                        {dream.name}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-charcoal/40 text-sm font-light leading-relaxed italic border-x border-zen-gold/20 px-12"
                    >
                        "{dream.description}"
                    </motion.p>
                </div>

                {/* Circular Countdown & Breathing Text */}
                <div className="flex flex-col items-center gap-12">
                    <div className="relative flex items-center justify-center">
                        <svg className="w-32 h-32 transform -rotate-90">
                            <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-charcoal/5" />
                            <motion.circle
                                cx="64" cy="64" r="60"
                                stroke="currentColor" strokeWidth="4"
                                fill="transparent" className="text-zen-gold"
                                initial={{ pathLength: 1 }}
                                animate={{ pathLength: secondsLeft / 60 }}
                                transition={{ ease: "linear" }}
                                strokeDasharray="377"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-4xl font-black text-charcoal">{secondsLeft}</span>
                            <span className="text-[8px] uppercase tracking-[0.3em] font-black text-charcoal/20">Seconds</span>
                        </div>
                    </div>

                    <motion.div
                        animate={{
                            scale: phase === 'inhale' ? 1.1 : 0.9,
                            opacity: phase === 'inhale' ? 1 : 0.6
                        }}
                        className="flex items-center gap-6 px-10 py-4 bg-white rounded-full border border-charcoal/5 shadow-sm"
                    >
                        <Wind className={`text-zen-gold transition-transform duration-1000 ${phase === 'inhale' ? 'rotate-12' : '-rotate-12'}`} size={20} />
                        <span className="text-xs font-black uppercase tracking-[0.5em] text-charcoal">
                            {phase === 'inhale' ? 'Deep Inhale' : 'Slow Exhale'}
                        </span>
                    </motion.div>
                </div>
            </div>

            {/* Binaural Frequency Visualizer (Bottom) */}
            <div className="absolute bottom-12 flex items-end gap-1 h-8">
                {[...Array(24)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            height: phase === 'inhale' ? [10, 32, 10] : [5, 12, 5],
                            opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{
                            duration: 1 + Math.random(),
                            repeat: Infinity,
                            delay: i * 0.05
                        }}
                        className="w-0.5 bg-zen-gold rounded-full"
                    />
                ))}
            </div>
        </motion.div>
    );
};

export default FocusMode;
