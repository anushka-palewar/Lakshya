import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/api';
import { motion } from 'framer-motion';
import { Target, Lock, User, ArrowRight } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authService.login(formData);
            navigate('/dashboard');
        } catch (err) {
            setError(
                err.response?.data?.message || 'Login failed. Please check your credentials.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 relative bg-[#FAFAFA]">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-indigo-50/50 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-50/50 rounded-full blur-[120px]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-lg relative z-10"
            >
                <div className="glass-card bg-white/70 border-white/50 p-12 md:p-16 shadow-2xl">
                    <div className="flex justify-center mb-10">
                        <div className="w-16 h-16 bg-indigo-500 rounded-[24px] flex items-center justify-center shadow-xl shadow-indigo-100">
                            <Target className="text-white" size={32} />
                        </div>
                    </div>

                    <div className="text-center mb-12">
                        <h1 className="heading-serif text-4xl text-slate-900 mb-3">Welcome Back</h1>
                        <p className="text-slate-400 font-light">Enter your sanctuary to align your intentions.</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-8 p-4 bg-rose-50 border-l-4 border-rose-400 text-rose-600 text-sm rounded-r-lg"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-1 mb-2 block">Username</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    placeholder="your_destiny"
                                    required
                                    className="w-full bg-slate-50/50 border-2 border-slate-50 rounded-2xl px-12 py-4 outline-none focus:border-indigo-100 focus:bg-white transition-all text-slate-700 placeholder:text-slate-300"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-1 mb-2 block">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-slate-50/50 border-2 border-slate-50 rounded-2xl px-12 py-4 outline-none focus:border-indigo-100 focus:bg-white transition-all text-slate-700 placeholder:text-slate-300"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold border-2 border-slate-900 hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200 mt-4 group"
                        >
                            {loading ? 'Entering Sanctuary...' : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center text-slate-400 font-light text-sm">
                        Don't have an account?
                        <Link to="/signup" className="text-indigo-500 font-semibold ml-2 hover:underline">Create account</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
