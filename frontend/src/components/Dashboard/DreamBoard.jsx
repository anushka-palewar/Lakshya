import { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Calendar, CheckCircle2, ChevronLeft, Target, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DreamBoard = () => {
    const [dreams, setDreams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        imageUrl: '',
        dueDate: '',
        isAchieved: false
    });

    useEffect(() => {
        fetchDreams();
    }, []);

    const fetchDreams = async () => {
        try {
            const response = await api.get('/dreams');
            setDreams(response.data);
        } catch (err) {
            setError('Could not load your dreams.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/dreams', formData);
            setShowModal(false);
            setFormData({ name: '', description: '', imageUrl: '', dueDate: '', isAchieved: false });
            fetchDreams();
        } catch (err) {
            setError('Failed to save dream.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/dreams/${id}`);
            fetchDreams();
        } catch (err) {
            setError('Failed to delete dream.');
        }
    };

    const toggleAchieved = async (dream) => {
        try {
            await api.put(`/dreams/${dream.id}`, {
                ...dream,
                isAchieved: !dream.isAchieved
            });
            fetchDreams();
        } catch (err) {
            setError('Failed to update dream status.');
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-12 relative overflow-hidden">
            {/* Zen Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 text-slate-400 hover:text-indigo-500 transition-colors mb-4 group"
                        >
                            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-medium uppercase tracking-widest">Back to Sanctuary</span>
                        </button>
                        <h1 className="heading-serif text-5xl md:text-6xl text-slate-900 mb-4">Vision Sanctuary</h1>
                        <p className="text-slate-400 font-light text-lg">Your architectural blueprints for a lived destiny.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="glass-card bg-white px-6 py-3 border-slate-100 shadow-sm flex items-center gap-3">
                            <Target className="text-indigo-400" size={20} />
                            <span className="text-slate-600 font-medium">
                                {dreams.length} Active {dreams.length === 1 ? 'Focus' : 'Intentions'}
                            </span>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
                        >
                            <Plus size={28} />
                        </button>
                    </div>
                </header>

                {error && (
                    <div className="mb-8 p-4 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100 flex items-center gap-3 text-sm">
                        <Sparkles size={16} /> {error}
                    </div>
                )}

                {/* Dream Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {dreams.map((dream, index) => (
                            <motion.div
                                key={dream.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`group relative glass-card bg-white/80 border-white p-5 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 rounded-[32px] ${dream.isAchieved ? 'grayscale-[0.8] opacity-70' : ''}`}
                            >
                                {/* Image Container */}
                                <div className="relative h-64 rounded-[24px] overflow-hidden mb-6">
                                    <img
                                        src={dream.imageUrl || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'}
                                        alt={dream.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button
                                            onClick={() => toggleAchieved(dream)}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${dream.isAchieved ? 'bg-emerald-500 text-white' : 'bg-white/90 text-slate-400 hover:text-emerald-500'}`}
                                        >
                                            <CheckCircle2 size={20} />
                                        </button>
                                    </div>
                                    {dream.isAchieved && (
                                        <div className="absolute inset-0 bg-emerald-900/10 flex items-center justify-center">
                                            <div className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl shadow-xl">
                                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em]">MANIFESTED</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="px-2">
                                    <h3 className="heading-serif text-2xl text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                                        {dream.name}
                                    </h3>
                                    <p className="text-slate-400 text-sm font-light leading-relaxed mb-6 line-clamp-2">
                                        {dream.description || 'No focus description provided.'}
                                    </p>

                                    <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Calendar size={14} />
                                            <span className="text-[11px] font-bold uppercase tracking-widest">
                                                {dream.dueDate ? new Date(dream.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Deadline'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(dream.id)}
                                            className="p-2 text-slate-200 hover:text-rose-400 transition-colors"
                                        >
                                            <Trash2 size={18} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Empty State */}
                    {dreams.length === 0 && !loading && (
                        <div className="col-span-full py-24 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-indigo-50 rounded-[32px] flex items-center justify-center mb-8 text-indigo-200">
                                <Plus size={48} strokeWidth={1} />
                            </div>
                            <h3 className="heading-serif text-3xl text-slate-900 mb-3">Your sky is currently clear.</h3>
                            <p className="text-slate-400 font-light mb-10 max-w-sm">Every great realization starts with a single point of intention. Add your first dream.</p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all"
                            >
                                Manifest Intention
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal - Unified Zen Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/10 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden border border-white"
                        >
                            <div className="p-10 pt-12 text-center border-b border-slate-50 relative">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="absolute top-8 right-8 text-slate-300 hover:text-slate-900"
                                >
                                    <Plus size={24} className="rotate-45" />
                                </button>
                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Sparkles className="text-indigo-400" size={32} />
                                </div>
                                <h2 className="heading-serif text-4xl text-slate-900 mb-2">Manifest Logic</h2>
                                <p className="text-slate-400 font-light">Structure your vision with absolute clarity.</p>
                            </div>

                            <form onSubmit={handleCreate} className="p-10 bg-[#FAFAFA]/50 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">The Dream Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="What are we manifesting?"
                                        className="w-full bg-white border-2 border-slate-50 rounded-2xl px-6 py-4 outline-none focus:border-indigo-100 transition-all text-slate-700 placeholder:text-slate-300"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Your 'Why'</label>
                                    <textarea
                                        placeholder="The deeper reason behind this pursuit..."
                                        rows="3"
                                        className="w-full bg-white border-2 border-slate-50 rounded-2xl px-6 py-4 outline-none focus:border-indigo-100 transition-all text-slate-700 placeholder:text-slate-300 resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Vision Date</label>
                                        <input
                                            type="date"
                                            className="w-full bg-white border-2 border-slate-50 rounded-2xl px-6 py-4 outline-none focus:border-indigo-100 transition-all text-slate-700"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Vision Link (URL)</label>
                                        <input
                                            type="url"
                                            placeholder="Image source..."
                                            className="w-full bg-white border-2 border-slate-50 rounded-2xl px-6 py-4 outline-none focus:border-indigo-100 transition-all text-slate-700 placeholder:text-slate-300 font-mono text-xs"
                                            value={formData.imageUrl}
                                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                                >
                                    Carve into Reality
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DreamBoard;
