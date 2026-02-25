import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Eraser, Info, Calculator, X } from 'lucide-react';
import type { Chit } from '../types';
import { useStore } from '../store';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface Props {
    onClose: () => void;
}

const initialForm = {
    name: '',
    totalMembers: 0,
    divisions: 1,
    monthlyAmount: 0,
    durationMonths: 0,
    startDate: new Date().toISOString().split('T')[0],
    commissionPercent: 5,
    commissionAmount: 0,
    luckyDrawsPerMonth: 0,
    auctionsPerMonth: 0,
};

const ChitRegistration: React.FC<Props> = ({ onClose }) => {
    const { addChit } = useStore();
    const [formData, setFormData] = useState(initialForm);

    const totalChitValue = formData.totalMembers * formData.monthlyAmount;

    // Auto-calculate commission based on which field was last updated
    // For simplicity, we can recalculate when percentage changes, or when amount changes
    const handleRecalculateCommissionFromPercent = (percent: number) => {
        const amt = (totalChitValue * percent) / 100;
        setFormData(prev => ({ ...prev, commissionPercent: percent, commissionAmount: amt }));
    };

    const handleRecalculateCommissionFromAmount = (amount: number) => {
        const pct = totalChitValue > 0 ? (amount / totalChitValue) * 100 : 0;
        setFormData(prev => ({ ...prev, commissionAmount: amount, commissionPercent: parseFloat(pct.toFixed(2)) }));
    };

    // Auto update commission amount if totalChitValue changes but percent is fixed
    useEffect(() => {
        if (totalChitValue > 0) {
            handleRecalculateCommissionFromPercent(formData.commissionPercent);
        }
    }, [totalChitValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'name' || name === 'startDate') {
            setFormData(prev => ({ ...prev, [name]: value }));
        } else if (name === 'commissionPercent') {
            handleRecalculateCommissionFromPercent(parseFloat(value) || 0);
        } else if (name === 'commissionAmount') {
            handleRecalculateCommissionFromAmount(parseFloat(value) || 0);
        } else {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        }
    };

    const handleClear = () => {
        setFormData(initialForm);
        toast.success('Form cleared');
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error('Please enter a Chit Name');
            return;
        }

        const newChit: Chit = {
            id: Math.random().toString(36).substr(2, 9),
            ...formData,
            totalChitValue,
            status: 'active',
        };

        addChit(newChit);
        toast.success('Chit registered successfully!');
        onClose();
    };

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 pb-24">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="btn-secondary p-2 group hover:bg-slate-200 transition-colors">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900">New Chit Registration</h1>
                </div>
                <button onClick={onClose} className="btn-secondary p-2 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors" title="Close">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSave}
                className="space-y-6"
            >
                <div className="card space-y-4 shadow-sm border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Info className="w-5 h-5 text-primary-500" />
                        Basic Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Chit Name <span className="text-red-500">*</span></label>
                            <input type="text" name="name" className="input-field" value={formData.name} onChange={handleChange} placeholder="e.g., Gold Chit A" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                            <input type="date" name="startDate" className="input-field" value={formData.startDate} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Total Members <span className="text-red-500">*</span></label>
                            <input type="number" name="totalMembers" className="input-field" value={formData.totalMembers || ''} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Divisions</label>
                            <input type="number" name="divisions" className="input-field" value={formData.divisions || ''} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="card space-y-4 shadow-sm border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Calculator className="w-5 h-5 text-primary-500" />
                        Financial Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Monthly Amount (₹) <span className="text-red-500">*</span></label>
                            <input type="number" name="monthlyAmount" className="input-field bg-emerald-50 focus:bg-white" value={formData.monthlyAmount || ''} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Duration (Months) <span className="text-red-500">*</span></label>
                            <input type="number" name="durationMonths" className="input-field" value={formData.durationMonths || ''} onChange={handleChange} required />
                        </div>

                        <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                            <span className="font-bold text-slate-700">Total Chit Value</span>
                            <span className="text-xl font-black text-primary-700">₹ {totalChitValue.toLocaleString()}</span>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Commission (%)</label>
                            <input type="number" step="0.01" name="commissionPercent" className="input-field" value={formData.commissionPercent || ''} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Commission (₹)</label>
                            <input type="number" name="commissionAmount" className="input-field" value={formData.commissionAmount || ''} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="card space-y-4 shadow-sm border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Event Configuration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Lucky Draws per Month</label>
                            <input type="number" name="luckyDrawsPerMonth" className="input-field" value={formData.luckyDrawsPerMonth || ''} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Auctions per Month</label>
                            <input type="number" name="auctionsPerMonth" className="input-field" value={formData.auctionsPerMonth || ''} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={handleClear} className="flex-1 btn-secondary py-4 flex items-center justify-center gap-2 hover:bg-slate-200 text-slate-700">
                        <Eraser className="w-5 h-5" />
                        Clear Details
                    </button>
                    <button type="submit" className="flex-[2] btn-primary py-4 flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl transition-shadow bg-primary-600 hover:bg-primary-700">
                        <Save className="w-6 h-6" />
                        Register Chit
                    </button>
                </div>
            </motion.form>
        </div>
    );
};

export default ChitRegistration;
