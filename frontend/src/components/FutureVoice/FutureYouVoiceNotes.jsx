import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Heart, Music, CheckCircle2 } from 'lucide-react';
import VoiceNoteRecorder from './VoiceNoteRecorder';
import LockedVoiceNotePlayer from './LockedVoiceNotePlayer';

/**
 * FutureYouVoiceNotes Component
 * 
 * Props:
 * - dreamId: The unique ID of the dream
 * - destinyDate: Target manifestation date (YYYY-MM-DD)
 * - isAchievedEarly: Boolean flag if dream was manually marked as achieved
 * - existingVoiceNote: Object containing { url, duration } if already recorded
 * - onVoiceRecorded: Callback(blob, metadata) when recording is finished
 * - onEarlyUnlock: Callback when user manually unlocks early
 */
const FutureYouVoiceNotes = ({
    dreamId,
    destinyDate,
    isAchievedEarly,
    existingVoiceNote,
    onVoiceRecorded,
    onEarlyUnlock
}) => {
    const [isRecordingMode, setIsRecordingMode] = useState(false);
    const [voiceNote, setVoiceNote] = useState(existingVoiceNote);
    const [showToast, setShowToast] = useState(false);

    const handleRecordingComplete = (blob, metadata) => {
        // Create a local URL for immediate preview/persistence in state
        const url = URL.createObjectURL(blob);
        const newNote = { url, duration: metadata.duration };

        setVoiceNote(newNote);
        setIsRecordingMode(false);
        setShowToast(true);

        // Call parent callback if provided
        if (onVoiceRecorded) {
            onVoiceRecorded(blob, metadata);
        }

        // Hide success toast after 4 seconds
        setTimeout(() => setShowToast(false), 4000);
    };

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {voiceNote ? (
                    // 1. Show Player if note exists
                    <motion.div
                        key="player-view"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <LockedVoiceNotePlayer
                            destinyDate={destinyDate}
                            isAchievedEarly={isAchievedEarly}
                            audioUrl={voiceNote.url}
                            onEarlyUnlock={onEarlyUnlock}
                        />
                    </motion.div>
                ) : isRecordingMode ? (
                    // 2. Show Recording UI
                    <motion.div
                        key="recorder-view"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="rounded-3xl bg-white/60 backdrop-blur-md border border-white p-2"
                    >
                        <VoiceNoteRecorder
                            onComplete={handleRecordingComplete}
                            onCancel={() => setIsRecordingMode(false)}
                        />
                    </motion.div>
                ) : (
                    // 3. Show "Invite" Button
                    <motion.div
                        key="invite-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group relative cursor-pointer"
                        onClick={() => setIsRecordingMode(true)}
                    >
                        <div className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-amber-100 hover:border-amber-300 bg-amber-50/10 hover:bg-amber-50/30 transition-all duration-500">
                            <div className="w-16 h-16 mb-4 rounded-full bg-white flex items-center justify-center text-amber-500 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all">
                                <Mic size={28} />
                            </div>
                            <h4 className="text-lg font-serif text-gray-800 mb-1">Message to Future You</h4>
                            <p className="text-sm text-gray-500 text-center max-w-[240px]">
                                Speak to the version of you who has already achieved this dream.
                            </p>

                            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-amber-600/60 uppercase tracking-widest bg-white/50 px-4 py-1.5 rounded-full border border-amber-50">
                                <Music size={12} />
                                Emotional Manifestation
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Toast */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className="fixed bottom-10 left-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl min-w-[320px]"
                    >
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">Message Recorded</p>
                            <p className="text-xs text-gray-400">Locked until {new Date(destinyDate).toLocaleDateString()}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FutureYouVoiceNotes;
