import React, { useState } from 'react';
import { LogOut, FileText, IndianRupee, PieChart, Users, Gift, BarChart3, Database, KeyRound, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { View } from '../App';
import type { User } from '../types';
import chitLogo from '../assets/chitLogo.png';

interface DashboardProps {
    onNavigate: (view: View) => void;
    onLogout: () => void;
    user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onLogout, user }) => {
    const [showProfile, setShowProfile] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="max-w-lg mx-auto p-4 md:p-6 min-h-screen flex flex-col bg-gradient-to-b from-blue-50/50 via-slate-50 to-indigo-50/30">
            <header className="flex flex-row justify-between items-start mb-8 pt-4 relative z-20">
                <div className="flex items-center gap-3">
                    <img src={chitLogo} alt="SWChits Logo" className="w-12 h-12 rounded-xl shadow-sm object-cover bg-white p-1" />
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">SWChits</h1>
                        <p className="text-sm text-slate-600 font-medium">Hello, {user.name || user.username}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowProfile(!showProfile)}
                        className="p-1 border-2 border-primary-500 rounded-full bg-white shadow-sm hover:scale-105 transition-transform"
                    >
                        <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold uppercase overflow-hidden">
                            {user.name ? user.name.charAt(0) : user.username.charAt(0)}
                        </div>
                    </button>
                </div>
            </header>

            {/* Profile Modal Overlay */}
            <AnimatePresence>
                {showProfile && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40"
                            onClick={() => setShowProfile(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.9 }}
                            className="absolute top-20 right-4 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-5 z-50 origin-top-right"
                        >
                            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                    Your Credentials
                                </h3>
                                <button onClick={onLogout} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Username</label>
                                    <p className="font-semibold text-slate-900 bg-slate-50 p-2 rounded-lg border border-slate-200">{user.username}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Password</label>
                                    <div className="relative">
                                        <p className="font-semibold text-slate-900 bg-slate-50 p-2 rounded-lg border border-slate-200 pr-10">
                                            {showPassword ? user.password : '••••••••'}
                                        </p>
                                        <button
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-slate-100">
                                    <label className="text-xs font-bold text-primary-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                                        <KeyRound className="w-3 h-3" />
                                        One-Time Key (PIN)
                                    </label>
                                    <p className="font-black text-2xl tracking-[0.5rem] text-slate-900 bg-primary-50/50 p-3 rounded-lg border border-primary-100 text-center">
                                        {user.pin || '------'}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1 text-center font-medium">Required for Backup Export/Import</p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Primary Services Row */}
            <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100/60 mb-6">
                <h2 className="text-sm font-bold text-slate-800 mb-5 px-1">Main Services</h2>
                <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                    <motion.div whileTap={{ scale: 0.95 }} onClick={() => onNavigate('registration')} className="flex flex-col items-center gap-2 cursor-pointer group">
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-sm shadow-blue-200 group-hover:-translate-y-1 transition-transform">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] md:text-xs font-bold text-slate-600 text-center leading-tight px-1">New</span>
                    </motion.div>

                    <motion.div whileTap={{ scale: 0.95 }} onClick={() => onNavigate('auction')} className="flex flex-col items-center gap-2 cursor-pointer group">
                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:-translate-y-1 transition-transform">
                            <FileText className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] md:text-xs font-bold text-slate-600 text-center leading-tight px-1">Auction Sheet</span>
                    </motion.div>

                    <motion.div whileTap={{ scale: 0.95 }} onClick={() => onNavigate('payment')} className="flex flex-col items-center gap-2 cursor-pointer group">
                        <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-sm shadow-emerald-200 group-hover:-translate-y-1 transition-transform">
                            <IndianRupee className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] md:text-xs font-bold text-slate-600 text-center leading-tight px-1">Payment</span>
                    </motion.div>

                    <motion.div whileTap={{ scale: 0.95 }} onClick={() => onNavigate('views')} className="flex flex-col items-center gap-2 cursor-pointer group">
                        <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-sm shadow-purple-200 group-hover:-translate-y-1 transition-transform">
                            <PieChart className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] md:text-xs font-bold text-slate-600 text-center leading-tight px-1">Reports</span>
                    </motion.div>
                </div>
            </div>

            {/* Secondary Services Row */}
            <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100/60 mb-6 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-50 rounded-full blur-xl opacity-60"></div>
                <h2 className="text-sm font-bold text-slate-800 mb-5 px-1 relative z-10">More Tools</h2>
                <div className="grid grid-cols-4 gap-y-6 gap-x-2 relative z-10">
                    <motion.div whileTap={{ scale: 0.95 }} onClick={() => onNavigate('prize')} className="flex flex-col items-center gap-2 cursor-pointer group">
                        <div className="relative">
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-[8px] font-black px-1.5 py-0.5 rounded-full whitespace-nowrap z-10">NEW</div>
                            <div className="w-14 h-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-pink-500 shadow-sm relative pt-1 group-hover:-translate-y-1 transition-transform">
                                <Gift className="w-6 h-6" />
                            </div>
                        </div>
                        <span className="text-[11px] md:text-xs font-bold text-slate-600 text-center leading-tight px-1">Prize</span>
                    </motion.div>

                    <motion.div whileTap={{ scale: 0.95 }} onClick={() => onNavigate('profit_loss')} className="flex flex-col items-center gap-2 cursor-pointer group">
                        <div className="w-14 h-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-amber-500 shadow-sm group-hover:-translate-y-1 transition-transform">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] md:text-xs font-bold text-slate-600 text-center leading-tight px-1">P & L</span>
                    </motion.div>

                    <motion.div whileTap={{ scale: 0.95 }} onClick={() => onNavigate('backup')} className="flex flex-col items-center gap-2 cursor-pointer group">
                        <div className="w-14 h-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:-translate-y-1 transition-transform">
                            <Database className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] md:text-xs font-bold text-slate-600 text-center leading-tight px-1">App Backup</span>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

