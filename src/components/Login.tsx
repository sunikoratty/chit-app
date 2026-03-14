import React, { useState } from 'react';
import { LogIn, ShieldCheck, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store';

interface LoginProps {
    onRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onRegister }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const login = useStore((state) => state.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = login(username, password);
        if (!success) {
            import('react-hot-toast').then(({ toast }) => {
                toast.error('Invalid credentials!');
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md card glass-effect"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary-200">
                        <ShieldCheck className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">SWChits</h1>
                    <p className="text-slate-500">Manage your chit funds with ease</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2 py-3">
                        <LogIn className="w-5 h-5" />
                        Sign In
                    </button>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-500 mb-3">New user? Create an account to get started.</p>
                    <button
                        onClick={onRegister}
                        className="w-full btn-secondary flex items-center justify-center gap-2 py-3 border-primary-200 text-primary-700 hover:bg-primary-50"
                    >
                        <UserPlus className="w-5 h-5" />
                        Register Here
                    </button>
                </div>

                <div className="mt-4 text-center">
                    <p className="text-xs text-slate-400">© 2026 SWChits Management</p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
