import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Pause, Play, Trash2, Check, AlertCircle } from 'lucide-react';
import { useMediaRecorder } from '../../hooks/useMediaRecorder';

const VoiceNoteRecorder = ({ onComplete, onCancel }) => {
    const {
        isRecording,
        isPaused,
        audioBlob,
        audioUrl,
        duration,
        error,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        clearRecording,
        stream
    } = useMediaRecorder();

    const [visualizerData, setVisualizerData] = useState(new Array(30).fill(5));
    const analyzerRef = useRef(null);
    const animationRef = useRef(null);
    const audioContextRef = useRef(null);

    // Simple waveform visualizer logic
    useEffect(() => {
        if (isRecording && !isPaused && stream) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyzer = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyzer);
            analyzer.fftSize = 64;
            analyzerRef.current = analyzer;
            audioContextRef.current = audioContext;

            const bufferLength = analyzer.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateVisualizer = () => {
                analyzer.getByteFrequencyData(dataArray);
                // Normalize and pick 30 values for our UI bars
                const normalizedData = Array.from(dataArray)
                    .slice(0, 30)
                    .map(val => Math.max(5, (val / 255) * 40));
                setVisualizerData(normalizedData);
                animationRef.current = requestAnimationFrame(updateVisualizer);
            };

            updateVisualizer();
        } else {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
            setVisualizerData(new Array(30).fill(5));
        }

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, [isRecording, isPaused, stream]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleKeep = () => {
        if (audioBlob) {
            onComplete(audioBlob, { duration });
        }
    };

    return (
        <div className="p-6 text-center">
            <AnimatePresence mode="wait">
                {!audioBlob ? (
                    <motion.div
                        key="recording-ui"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">
                            {isRecording ? (isPaused ? 'Recording Paused' : 'Listening...') : 'Ready to record'}
                        </div>

                        {/* Waveform Visualization */}
                        <div className="flex items-end justify-center gap-1 h-12 w-full max-w-xs overflow-hidden">
                            {visualizerData.map((height, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ height }}
                                    className={`w-1 rounded-full ${isRecording && !isPaused ? 'bg-amber-400' : 'bg-gray-200'}`}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                />
                            ))}
                        </div>

                        <div className="text-4xl font-light font-mono text-gray-800">
                            {formatTime(duration)}
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 px-4 py-2 rounded-full">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            {isRecording ? (
                                <>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={isPaused ? resumeRecording : pauseRecording}
                                        className="p-4 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    >
                                        {isPaused ? <Play fill="currentColor" size={24} /> : <Pause fill="currentColor" size={24} />}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={stopRecording}
                                        className="p-6 rounded-full bg-red-500 text-white shadow-lg shadow-red-200"
                                    >
                                        <Square fill="white" size={28} />
                                    </motion.button>
                                </>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={startRecording}
                                    className="flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white font-semibold shadow-xl shadow-amber-200 animate-pulse-gold"
                                >
                                    <Mic size={24} />
                                    Start Recording
                                </motion.button>
                            )}
                        </div>

                        {!isRecording && (
                            <button
                                onClick={onCancel}
                                className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-4"
                            >
                                Maybe later
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="preview-ui"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="text-sm font-medium text-amber-600 uppercase tracking-widest">
                            Message Captured
                        </div>

                        <audio controls src={audioUrl} className="w-full max-w-sm rounded-full bg-gray-50 px-2" />

                        <div className="flex items-center gap-4 mt-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={clearRecording}
                                className="flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
                            >
                                <Trash2 size={18} />
                                Re-record
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleKeep}
                                className="flex items-center gap-2 px-8 py-3 rounded-full bg-green-500 text-white font-semibold shadow-lg shadow-green-100"
                            >
                                <Check size={18} />
                                Keep Message
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VoiceNoteRecorder;
