import React from 'react';
import FutureYouVoiceNotes from './FutureYouVoiceNotes';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const VoiceNoteDemo = () => {
    // A dummy destiny date 3 years from now for the demo
    const futureDate = "2029-03-09";

    return (
        <div className="min-h-screen bg-[#FAFAFA] py-12 px-4">
            <div className="max-w-xl mx-auto">
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 mb-12 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Go back to Dashboard
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-amber-100">
                        <Sparkles size={14} />
                        Experimental Feature
                    </div>
                    <h1 className="text-4xl font-serif text-gray-800 mb-4">Future You Voice Notes</h1>
                    <p className="text-gray-500 leading-relaxed">
                        Experience the "Dream Sanctuary" recorder. Record a message to your future self,
                        and see how it looks when locked in time.
                    </p>
                </motion.div>

                <div className="glass-card p-1">
                    <FutureYouVoiceNotes
                        dreamId="demo-dream"
                        destinyDate={futureDate}
                        isAchievedEarly={false}
                        onVoiceRecorded={(blob, meta) => console.log("Demo recorded:", blob, meta)}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-16 bg-white/50 border border-gray-100 rounded-3xl p-6 text-center"
                >
                    <h3 className="font-serif text-lg text-gray-800 mb-2">How it works</h3>
                    <ul className="text-sm text-gray-500 space-y-3 text-left max-w-sm mx-auto">
                        <li className="flex gap-3">
                            <span className="shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-bold">1</span>
                            <span>Recording is captured as a <b>Blob</b> using the browser's native API.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-bold">2</span>
                            <span>The player checks the current date vs. the <b>Destiny Date</b>.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-bold">3</span>
                            <span>If not yet reached, the message stays <b>Locked</b> with an ethereal blur.</span>
                        </li>
                    </ul>
                </motion.div>
            </div>
        </div>
    );
};

export default VoiceNoteDemo;
