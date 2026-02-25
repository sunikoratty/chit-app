import React, { useState, useMemo } from 'react';
import { ArrowLeft, Save, Eraser, X, Calculator, AlertCircle } from 'lucide-react';
import { useStore } from '../store';
import type { AuctionSheet, LelamEvent } from '../types';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface Props {
    onClose: () => void;
}

const AuctionSheetForm: React.FC<Props> = ({ onClose }) => {
    const { chits, saveAuctionSheet, auctionSheets } = useStore();
    const [selectedChitId, setSelectedChitId] = useState<string>('');
    const [month, setMonth] = useState<number>(2);

    const activeChit = useMemo(() => chits.find(c => c.id === selectedChitId), [chits, selectedChitId]);

    // Initialize events based on the selected chit
    const initialEvents = useMemo<LelamEvent[]>(() => {
        if (!activeChit) return [];
        const events: LelamEvent[] = [];

        for (let i = 0; i < activeChit.luckyDrawsPerMonth; i++) {
            events.push({ id: Math.random().toString(), type: 'lucky_draw', auctionDiscount: 0 });
        }
        for (let i = 0; i < activeChit.auctionsPerMonth; i++) {
            events.push({ id: Math.random().toString(), type: 'auction', auctionDiscount: 0 }); // NaN or 0? Use undefined to check for empty later? We will use string for input
        }
        return events;
    }, [activeChit]);

    const [eventsData, setEventsData] = useState<string[]>([]);

    // When chit changes or month changes, attempt to load existing data
    React.useEffect(() => {
        if (!activeChit) {
            setEventsData([]);
            return;
        }

        const existingSheet = auctionSheets.find(s => s.chitId === activeChit.id && s.month === month);
        if (existingSheet) {
            setEventsData(existingSheet.events.map(e => e.auctionDiscount.toString()));
        } else {
            // Setup defaults
            setEventsData(initialEvents.map(e => e.type === 'lucky_draw' ? '0' : ''));
        }
    }, [activeChit, month, auctionSheets, initialEvents]);

    const handleDiscountChange = (index: number, value: string) => {
        const newData = [...eventsData];
        newData[index] = value;
        setEventsData(newData);
    };

    const handleClearCurrentMonth = () => {
        setEventsData(initialEvents.map(e => e.type === 'lucky_draw' ? '0' : ''));
        toast.success("Current month's discounts cleared.");
    };

    // Computations
    const foremanCommission = 0; // "Already taken in the first month-, So, Zero." requirement

    const sumDiscounts = eventsData.reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
    const totalDividend = sumDiscounts - foremanCommission;

    let deductionPerMember = 0;
    let netMonthlyPay = 0;

    if (activeChit && activeChit.totalMembers > 0) {
        deductionPerMember = Math.round(totalDividend / activeChit.totalMembers);
        netMonthlyPay = activeChit.monthlyAmount - deductionPerMember;
    }

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        if (!activeChit) {
            toast.error("Please select a Chit");
            return;
        }

        // Double check validation: any empty fields?
        const totalExpectedEvents = activeChit.luckyDrawsPerMonth + activeChit.auctionsPerMonth;
        const hasEmpty = eventsData.some(val => val === '');

        if (hasEmpty) {
            toast.error(`Please enter values for all ${totalExpectedEvents} events before updating.`);
            return;
        }

        const lelamEvents: LelamEvent[] = initialEvents.map((evt, idx) => ({
            ...evt,
            auctionDiscount: parseFloat(eventsData[idx]) || 0
        }));

        const existingSheet = auctionSheets.find(s => s.chitId === activeChit.id && s.month === month);

        const newSheet: AuctionSheet = {
            id: existingSheet ? existingSheet.id : Math.random().toString(36).substr(2, 9),
            chitId: activeChit.id,
            month,
            events: lelamEvents,
            foremanCommission,
            totalDividend,
            deductionPerMember,
            netMonthlyPay
        };

        saveAuctionSheet(newSheet);
        toast.success(`Month ${month} Auction Sheet Saved Successfully!`);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="btn-secondary p-2 group hover:bg-slate-200 transition-colors">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        Auction / Lucky Draw Sheets
                    </h1>
                </div>
                <button onClick={onClose} className="btn-secondary p-2 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors" title="Close">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="card shadow-sm border-slate-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Chit Name</label>
                        <select
                            className="input-field cursor-pointer bg-slate-50 border-slate-300"
                            value={selectedChitId}
                            onChange={(e) => setSelectedChitId(e.target.value)}
                        >
                            <option value="">-- Select a Registered Chit --</option>
                            {chits.map(c => (
                                <option key={c.id} value={c.id}>{c.name} ({c.durationMonths} Months)</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Month No.</label>
                        <select
                            className="input-field cursor-pointer bg-slate-50 border-slate-300"
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            disabled={!activeChit}
                        >
                            {activeChit && Array.from({ length: activeChit.durationMonths - 1 }, (_, i) => i + 2).map(m => (
                                <option key={m} value={m}>Month {m}</option>
                            ))}
                            {!activeChit && <option value="2">Month 2</option>}
                        </select>
                    </div>
                </div>
            </div>

            {activeChit ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="card shadow-sm border-slate-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                Event Discounts
                            </h2>
                            <span className="text-sm px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-full border border-blue-100">
                                {activeChit.luckyDrawsPerMonth + activeChit.auctionsPerMonth} Events Expected
                            </span>
                        </div>

                        {initialEvents.length === 0 ? (
                            <div className="p-4 bg-orange-50 text-orange-700 rounded-xl flex items-center gap-2 border border-orange-100">
                                <AlertCircle className="w-5 h-5" />
                                <p>This chit has no events configured per month.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {initialEvents.map((evt, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="w-full sm:w-1/3 flex items-center gap-2">
                                            <span className="font-bold text-slate-500 w-6">{idx + 1}.</span>
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full w-28 text-center ${evt.type === 'lucky_draw' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {evt.type === 'lucky_draw' ? 'Lucky Draw' : 'Auction'}
                                            </span>
                                        </div>
                                        <div className="w-full sm:w-2/3">
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                                                <input
                                                    type="number"
                                                    className="input-field pl-8 placeholder-slate-300"
                                                    value={eventsData[idx] ?? ''}
                                                    onChange={(e) => handleDiscountChange(idx, e.target.value)}
                                                    placeholder="Enter Auction Discount"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="card shadow-sm border-slate-200 bg-gradient-to-br from-white to-slate-50">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                            <Calculator className="w-5 h-5 text-primary-500" />
                            Monthly Calculations
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Foreman Comm.</span>
                                <span className="text-lg font-bold text-slate-700">₹ {foremanCommission}</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Dividend</span>
                                <span className="text-lg font-bold text-slate-700">₹ {totalDividend.toLocaleString()}</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 shadow-sm">Ded. per Member</span>
                                <span className="text-lg font-bold text-blue-600">₹ {deductionPerMember.toLocaleString()}</span>
                            </div>
                            <div className="bg-emerald-500 p-4 rounded-xl shadow-lg shadow-emerald-200 flex flex-col justify-between transform transition-transform hover:scale-105">
                                <span className="text-xs font-bold text-emerald-100 uppercase tracking-widest mb-1">Net Monthly Pay</span>
                                <span className="text-xl font-black text-white">₹ {netMonthlyPay.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button type="button" onClick={handleClearCurrentMonth} className="flex-1 btn-secondary py-4 flex items-center justify-center gap-2 hover:bg-slate-200 text-slate-700">
                            <Eraser className="w-5 h-5" />
                            Clear Discounts
                        </button>
                        <button type="button" onClick={handleSave} className="flex-[2] btn-primary py-4 flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl transition-shadow bg-blue-600 hover:bg-blue-700">
                            <Save className="w-6 h-6" />
                            Update & Save
                        </button>
                    </div>

                </motion.div>
            ) : (
                <div className="text-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                    <Calculator className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Please select a Chit to record auction details.</p>
                </div>
            )}
        </div>
    );
};

export default AuctionSheetForm;
