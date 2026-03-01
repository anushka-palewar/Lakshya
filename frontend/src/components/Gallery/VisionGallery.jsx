import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Search,
    Filter,
    Calendar,
    Target,
    LayoutGrid,
    LayoutList,
    Sparkles,
    ShieldCheck,
    X
} from 'lucide-react';
import { dreamService } from '../../services/api';

const VisionGallery = () => {
    const navigate = useNavigate();
    const [dreams, setDreams] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDreams = async () => {
            try {
                const response = await dreamService.getDreams();
                setDreams(response.data);
            } catch (err) {
            } finally {
                setLoading(false);
            }
        };
        fetchDreams();
    }, []);

    const filteredDreams = dreams.filter(dream => {
        const matchesSearch = dream.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dream.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || (filter === 'achieved' ? dream.isAchieved : !dream.isAchieved);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-[#F8F6F2] pt-32 pb-40 px-8 selection:bg-zen-gold/20">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-32 space-y-12 text-center">
                <motion.button
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    onClick={() => navigate('/dashboard')}
                    className="group flex items-center gap-4 text-charcoal/30 hover:text-zen-gold transition-all mx-auto px-6 py-2 rounded-full border border-charcoal/5 bg-white shadow-sm"
                >
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] uppercase tracking-[0.5em] font-black">Return to Sanctuary</span>
                </motion.button>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <h1 className="heading-serif text-8xl text-charcoal mb-4 tracking-tight">The Vision <span className="text-zen-gold italic block mt-2">Gallery</span></h1>
                    <p className="text-charcoal/40 font-light text-lg tracking-[0.3em] uppercase text-[10px] max-w-lg mx-auto leading-relaxed">Every vision is a frequency waiting to be tuned.</p>
                </motion.div>

                {/* Filters & Search Control */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col md:flex-row items-center justify-between gap-8 glass-card bg-white p-6 rounded-[2.5rem] border border-charcoal/5 shadow-xl max-w-5xl mx-auto"
                >
                    <div className="relative w-full md:w-[400px]">
                        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-charcoal/20" size={18} />
                        <input
                            type="text"
                            placeholder="Seek specific manifestations..."
                            className="w-full bg-charcoal/2 border border-charcoal/5 rounded-3xl py-5 pl-16 pr-8 text-sm text-charcoal focus:bg-white focus:border-zen-gold/30 outline-none transition-all placeholder:text-charcoal/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                        {['all', 'in-progress', 'achieved'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-10 py-5 rounded-[20px] text-[9px] uppercase tracking-[0.4em] font-black transition-all whitespace-nowrap
                                    ${filter === f
                                        ? 'bg-zen-gold text-white shadow-lg shadow-gold-glow scale-105'
                                        : 'bg-white text-charcoal/40 border border-charcoal/5 hover:border-zen-gold/30'}`}
                            >
                                {f.replace('-', ' ')}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Gallery Grid */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-60 gap-8">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                            className="text-zen-gold"
                        >
                            <Sparkles size={64} className="opacity-20" />
                        </motion.div>
                        <p className="text-[10px] uppercase tracking-[0.8em] text-charcoal/20 font-black animate-pulse">Syncing Visual Frequencies...</p>
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-10 space-y-10">
                        {filteredDreams.map((dream, idx) => (
                            <motion.div
                                key={dream.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ scale: 1.02 }}
                                className="break-inside-avoid relative group rounded-[48px] overflow-hidden bg-white border border-charcoal/5 shadow-md hover:shadow-2xl transition-all duration-700 cursor-pointer"
                            >
                                <div className="aspect-[4/5] overflow-hidden relative">
                                    <motion.img
                                        src={dream.imageUrl || 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80'}
                                        className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                                        alt={dream.name}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 p-12 flex flex-col justify-end">
                                        <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                                            <span className="text-[9px] uppercase tracking-[0.5em] text-zen-gold font-black mb-4 block">{dream.category || 'Vision'}</span>
                                            <h3 className="heading-serif text-4xl text-white mb-4 tracking-tight leading-tight">{dream.name}</h3>
                                            <p className="text-white/60 text-xs font-light leading-relaxed mb-6 line-clamp-3">
                                                {dream.description}
                                            </p>
                                            <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                                                <div className="flex items-center gap-2 text-white/40">
                                                    <Calendar size={14} />
                                                    <span className="text-[9px] uppercase tracking-widest leading-none">{new Date(dream.dueDate).getFullYear()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="absolute top-10 right-10 flex items-center gap-3 px-5 py-2.5 bg-white/90 backdrop-blur-xl rounded-full border border-charcoal/5 shadow-sm">
                                        <div className={`w-2 h-2 rounded-full ${dream.isAchieved ? 'bg-zen-gold' : 'bg-charcoal/20'}`} />
                                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-charcoal/40">
                                            {dream.isAchieved ? 'Manifested' : 'Alignment'}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {!loading && filteredDreams.length === 0 && (
                    <div className="text-center py-60 space-y-12">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto text-charcoal/5 border border-charcoal/5 shadow-inner">
                            <Search size={40} />
                        </div>
                        <div className="space-y-4">
                            <h3 className="heading-serif text-5xl text-charcoal/20 italic">No frequencies identified</h3>
                            <p className="text-[10px] uppercase tracking-[0.6em] text-charcoal/10 font-black">Adjust your sensory filters</p>
                        </div>
                        <button
                            onClick={() => { setSearchQuery(''); setFilter('all'); }}
                            className="px-10 py-4 bg-white border border-charcoal/5 text-zen-gold text-[10px] uppercase tracking-[0.5em] font-black hover:bg-zen-gold hover:text-white transition-all rounded-full shadow-sm"
                        >
                            Reset Parameters
                        </button>
                    </div>
                )}
            </div>

            {/* Minimal Footer */}
            <div className="mt-40 max-w-7xl mx-auto border-t border-charcoal/5 pt-16 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
                <div className="flex items-center gap-4">
                    <ShieldCheck size={16} className="text-zen-gold" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">Vault Protection Enabled</span>
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.6em]">Sankalp AI — Archive 2026</p>
            </div>
        </div>
    );
};

export default VisionGallery;
