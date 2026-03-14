import React, { useState, useMemo } from 'react';
import { ArrowLeft, CreditCard, Eraser, X, Calculator, ShieldCheck } from 'lucide-react';
import { useStore } from '../store';
import type { PaymentCollection } from '../types';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    onClose: () => void;
}

const PaymentCollectionForm: React.FC<Props> = ({ onClose }) => {
    const { chits, auctionSheets, payments, savePayment } = useStore();
    const [selectedChitId, setSelectedChitId] = useState<string>('');
    const [month, setMonth] = useState<number>(1);

    // Form fields
    const [dateOfPayment, setDateOfPayment] = useState<string>(new Date().toISOString().split('T')[0]);
    const [amountCollectedStr, setAmountCollectedStr] = useState<string>('');
    const [receivedBy, setReceivedBy] = useState<string>('');

    const activeChit = useMemo(() => chits.find(c => c.id === selectedChitId), [chits, selectedChitId]);

    // Calculate next month to be paid
    const nextMonthToPay = useMemo(() => {
        if (!activeChit) return 1;
        const chitPayments = payments.filter(p => p.chitId === activeChit.id);
        if (chitPayments.length === 0) return 1;
        const maxMonth = Math.max(...chitPayments.map(p => p.month));
        return Math.min(maxMonth + 1, activeChit.durationMonths);
    }, [activeChit, payments]);

    React.useEffect(() => {
        setMonth(nextMonthToPay);
    }, [nextMonthToPay]);

    // Find if a payment already exists for this chit and month
    const existingPayment = useMemo(() => {
        if (!activeChit) return null;
        return payments.find(p => p.chitId === activeChit.id && p.month === month);
    }, [activeChit, month, payments]);

    // Calculate Amount Due
    const amountDue = useMemo(() => {
        if (!activeChit) return 0;

        if (month === 1) {
            // First month has no previous auction deduction, full amount is expected
            return activeChit.monthlyAmount;
        } else {
            // Look up the auction sheet from the PREVIOUS month
            const prevMonthSheet = auctionSheets.find(s => s.chitId === activeChit.id && s.month === (month - 1));
            if (prevMonthSheet) {
                // Next month amount due: Monthly amount - last month's deduction per member (truncated calculation)
                return prevMonthSheet.netMonthlyPay;
            } else {
                return -1; // Indicates prev month sheet not found
            }
        }
    }, [activeChit, month, auctionSheets]);

    // Calculate previously paid amount to allow multiple partial payments? 
    // The requirement implies they enter a single transaction. But if they already paid partially...
    // We'll keep it simple for now as requested.

    const amountCollected = parseFloat(amountCollectedStr) || 0;

    let balance = 0;
    let statusText = 'Pending';
    let statusColor = 'text-amber-500';

    if (amountDue >= 0) {
        // Total balance remaining for this month
        // The display balance = Amount Due - (Previously paid? Or just the current input?)
        // If we want to overwrite, we do `amountDue - amountCollected`. Let's assume overwriting or full payment.

        // Actually the user stated:
        // Amount Due - [Amount Collected] = Balance / Status
        balance = amountDue - amountCollected;

        if (balance <= 0 && amountCollected > 0) {
            statusText = 'Fully Paid';
            statusColor = 'text-green-600 bg-green-50';
        } else if (amountCollected > 0 && balance > 0) {
            statusText = 'Partially Paid';
            statusColor = 'text-blue-600 bg-blue-50';
        } else {
            statusText = 'Pending';
            statusColor = 'text-amber-600 bg-amber-50';
        }
    }

    const handleClear = () => {
        setDateOfPayment(new Date().toISOString().split('T')[0]);
        setAmountCollectedStr('');
        setReceivedBy('');
        toast.success("Form cleared");
    };

    const handlePay = (e: React.FormEvent) => {
        e.preventDefault();

        if (!activeChit) {
            toast.error("Please select a Chit");
            return;
        }

        if (amountDue === -1) {
            toast.error(`Please calculate the Auction Sheet for Month ${month - 1} first.`);
            return;
        }

        if (amountCollected <= 0) {
            toast.error("Please enter a valid collected amount.");
            return;
        }

        if (!receivedBy.trim()) {
            toast.error("Please enter who collected the amount.");
            return;
        }

        const newPayment: PaymentCollection = {
            id: existingPayment ? existingPayment.id : Math.random().toString(36).substr(2, 9),
            dateOfPayment,
            chitId: activeChit.id,
            month,
            amountDue,
            amountCollected,
            receivedBy,
            status: balance <= 0 ? 'paid' : 'partially_paid',
            submissionTimestamp: new Date().toLocaleString()
        };

        savePayment(newPayment);
        toast.success(`Payment of ₹${amountCollected} recorded successfully!`);

        if (balance <= 0) {
            onClose(); // Optional exit after full payment
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 pb-24">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="btn-secondary p-2 group hover:bg-slate-200 transition-colors">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        Payment Record
                    </h1>
                </div>
                <button onClick={onClose} className="btn-secondary p-2 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors" title="Close">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="card shadow-sm border-slate-200 mb-6 bg-gradient-to-br from-white to-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Chit Name</label>
                        <select
                            className="input-field cursor-pointer bg-white border-slate-300"
                            value={selectedChitId}
                            onChange={(e) => {
                                setSelectedChitId(e.target.value);
                                setAmountCollectedStr('');
                            }}
                        >
                            <option value="">-- Select a Registered Chit --</option>
                            {chits.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <div className="flex justify-between mb-2 items-center">
                            <label className="block text-sm font-bold text-slate-700">Month No.</label>
                            {activeChit && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                    Next: {nextMonthToPay}
                                </span>
                            )}
                        </div>
                        <select
                            className="input-field cursor-pointer bg-white border-slate-300"
                            value={month}
                            onChange={(e) => {
                                setMonth(parseInt(e.target.value));
                                setAmountCollectedStr('');
                            }}
                            disabled={!activeChit}
                        >
                            {activeChit && Array.from({ length: activeChit.durationMonths }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>Month {m}</option>
                            ))}
                            {!activeChit && <option value="1">Month 1</option>}
                        </select>
                    </div>
                </div>
            </div>

            {activeChit ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                    {amountDue === -1 ? (
                        <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 flex flex-col items-center justify-center text-center shadow-inner">
                            <Calculator className="w-10 h-10 mb-3 text-red-400" />
                            <h3 className="text-lg font-bold mb-1">Previous Month's Auction Sheet Missing</h3>
                            <p className="text-sm font-medium">The Auction/Lucky Draw sheet for <b>Month {month - 1}</b> has not been generated yet. Please calculate it first to determine the deduction for this month's payment.</p>
                        </div>
                    ) : (
                        <div className="card shadow-sm border-slate-200 space-y-6">

                            {existingPayment && (
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-4 mb-4">
                                    <ShieldCheck className="w-6 h-6 text-emerald-500 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-emerald-800">Existing Record Found</h4>
                                        <p className="text-sm text-emerald-600 font-medium">
                                            A payment of <b>₹{existingPayment.amountCollected}</b> was collected by <b>{existingPayment.receivedBy}</b> on {existingPayment.dateOfPayment}.
                                        </p>
                                        <p className="text-xs text-emerald-500 mt-1 uppercase tracking-wider font-bold">Status: {existingPayment.status}</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Amount Due (₹)</label>
                                    <input
                                        type="text"
                                        className="input-field bg-slate-100 font-bold text-slate-700 cursor-not-allowed"
                                        value={`₹ ${amountDue.toLocaleString()}`}
                                        readOnly
                                    />
                                    <p className="text-xs text-slate-400 mt-1 font-bold pl-1 uppercase tracking-wide">Calculated from Net Monthly Pay</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Date of Payment</label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        value={dateOfPayment}
                                        onChange={(e) => setDateOfPayment(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Amount Collected (₹) <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        className="input-field bg-emerald-50 border-emerald-200 text-lg font-bold text-emerald-900 focus:bg-white"
                                        value={amountCollectedStr}
                                        onChange={(e) => setAmountCollectedStr(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Collected By <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={receivedBy}
                                        onChange={(e) => setReceivedBy(e.target.value)}
                                        placeholder="Enter name for Responsibility"
                                    />
                                </div>
                            </div>

                            <AnimatePresence>
                                {amountCollectedStr && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className={`mt-4 p-5 rounded-xl border flex justify-between items-center shadow-sm ${statusColor}`}
                                    >
                                        <div>
                                            <span className="block text-xs uppercase tracking-wider font-bold opacity-75 mb-1">Current Status / Balance</span>
                                            <span className="text-lg font-black">{statusText}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-xs uppercase tracking-wider font-bold opacity-75 mb-1">Remaining Balance</span>
                                            <span className="text-2xl font-black">₹ {Math.max(0, balance).toLocaleString()}</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex gap-4 pt-4 border-t border-slate-100">
                                <button type="button" onClick={handleClear} className="flex-1 btn-secondary py-4 flex items-center justify-center gap-2 hover:bg-slate-200 text-slate-700">
                                    <Eraser className="w-5 h-5" />
                                    Clear Details
                                </button>
                                <button type="button" onClick={handlePay} className="flex-[2] btn-primary py-4 flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl transition-shadow bg-emerald-600 hover:bg-emerald-700">
                                    <CreditCard className="w-6 h-6" />
                                    Process Payment
                                </button>
                            </div>
                        </div>

                    )}
                </motion.div>
            ) : (
                <div className="text-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                    <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Please select a Chit to record a payment.</p>
                </div>
            )}
        </div>
    );
};

export default PaymentCollectionForm;
