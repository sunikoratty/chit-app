import React, { useState } from 'react';
import { useStore } from '../store';
import { ArrowLeft, Gift, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Prize } from '../types';

interface Props {
    onClose: () => void;
}

const PrizeEntryForm: React.FC<Props> = ({ onClose }) => {
    const { chits, savePrize } = useStore();
    const [chitId, setChitId] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<'lucky_draw' | 'auction'>('lucky_draw');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chitId) {
            toast.error('Please select a chit');
            return;
        }
        if (!amount || Number(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        const newPrize: Prize = {
            id: crypto.randomUUID(),
            chitId,
            amount: Number(amount),
            date,
            type
        };

        savePrize(newPrize);
        toast.success('Prize details added successfully');
        onClose();
    };

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8 pb-24">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onClose} className="btn-secondary p-2 group hover:bg-slate-200 transition-colors">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Gift className="w-6 h-6 text-primary-500" />
                    Prize Entry
                </h1>
            </div>

            <div className="card shadow-xl border-slate-200 bg-white">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Select Chit</label>
                            <select
                                className="input-field bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                value={chitId}
                                onChange={(e) => setChitId(e.target.value)}
                                required
                            >
                                <option value="">Select a Chit</option>
                                {chits.map((chit) => (
                                    <option key={chit.id} value={chit.id}>
                                        {chit.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Prize Type</label>
                            <select
                                className="input-field bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                value={type}
                                onChange={(e) => setType(e.target.value as 'lucky_draw' | 'auction')}
                                required
                            >
                                <option value="lucky_draw">Lucky Draw</option>
                                <option value="auction">Auction</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <input
                                    type="number"
                                    className="input-field pl-8 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Date of Draw</label>
                            <input
                                type="date"
                                className="input-field bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 btn-secondary py-4 font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 btn-primary py-4 font-bold flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PrizeEntryForm;
