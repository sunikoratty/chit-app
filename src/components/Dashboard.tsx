import React from 'react';
import { User, LogOut, FileText, IndianRupee, PieChart, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import type { View } from '../App';

interface DashboardProps {
    onNavigate: (view: View) => void;
    onLogout: () => void;
    username: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onLogout, username }) => {
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <div className="flex items-center gap-2 text-slate-500 mt-1">
                        <User className="w-4 h-4 text-primary-500" />
                        <span className="text-sm font-medium">Welcome, {username}</span>
                    </div>
                </div>
                <div>
                    <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="card cursor-pointer hover:border-primary-300 hover:shadow-xl hover:shadow-primary-100/50 transition-all flex flex-col items-center p-8 bg-gradient-to-br from-white to-primary-50/50 border-2 border-transparent"
                    onClick={() => onNavigate('registration')}
                >
                    <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner rotate-3 transition-transform group-hover:rotate-6">
                        <Users className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Registration</h3>
                    <p className="text-slate-500 text-center text-sm">Create and configure new Chits and setup members.</p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="card cursor-pointer hover:border-purple-300 hover:shadow-xl hover:shadow-purple-100/50 transition-all flex flex-col items-center p-8 bg-gradient-to-br from-white to-purple-50/50 border-2 border-transparent"
                    onClick={() => onNavigate('auction')}
                >
                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner -rotate-3 transition-transform group-hover:-rotate-6">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Auction Sheets</h3>
                    <p className="text-slate-500 text-center text-sm">Record monthly auction details and lucky draws.</p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="card cursor-pointer hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-100/50 transition-all flex flex-col items-center p-8 bg-gradient-to-br from-white to-emerald-50/50 border-2 border-transparent"
                    onClick={() => onNavigate('payment')}
                >
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner rotate-3 transition-transform group-hover:rotate-6">
                        <IndianRupee className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Collection</h3>
                    <p className="text-slate-500 text-center text-sm">Process monthly collections from members.</p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="card cursor-pointer hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100/50 transition-all flex flex-col items-center p-8 bg-gradient-to-br from-white to-blue-50/50 border-2 border-transparent"
                    onClick={() => onNavigate('views')}
                >
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner -rotate-3 transition-transform group-hover:-rotate-6">
                        <PieChart className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Reports & Views</h3>
                    <p className="text-slate-500 text-center text-sm">View details, filter reports, and manage data.</p>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
