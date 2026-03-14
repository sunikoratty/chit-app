import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { ArrowLeft, BarChart3, Filter } from 'lucide-react';

interface Props {
    onClose: () => void;
}

const ProfitLossReport: React.FC<Props> = ({ onClose }) => {
    const { chits, prizes, payments } = useStore();
    const [filterChitId, setFilterChitId] = useState<string>('');

    const stats = useMemo(() => {
        const filteredChits = filterChitId
            ? chits.filter(c => c.id === filterChitId)
            : chits;

        let totalPrizeAmount = 0;
        let totalPaidAmount = 0;
        let totalAmountToBePaid = 0;
        const totalNoOfChits = filteredChits.length;

        filteredChits.forEach(chit => {
            const chitPrizes = prizes.filter(p => p.chitId === chit.id);
            totalPrizeAmount += chitPrizes.reduce((sum, p) => sum + p.amount, 0);

            const chitPayments = payments.filter(p => p.chitId === chit.id);
            totalPaidAmount += chitPayments.reduce((sum, p) => sum + p.amountCollected, 0);

            totalAmountToBePaid += (chit.monthlyAmount * chit.durationMonths);
        });

        // Exact requested formulas by user:
        const totalDiscount = totalAmountToBePaid - totalPaidAmount;
        const balanceToPay = totalAmountToBePaid - totalPaidAmount; // usually the same in chit math, using implied identical formula.
        const netProfit = totalPaidAmount - totalPrizeAmount;

        return {
            totalNoOfChits,
            totalPrizeAmount,
            totalAmountToBePaid,
            totalPaidAmount,
            totalDiscount,
            balanceToPay,
            netProfit
        };
    }, [chits, prizes, payments, filterChitId]);

    const statCards = filterChitId ? [
        { label: 'Total Prize Amount', value: stats.totalPrizeAmount, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Total Amount To Paid', value: stats.totalAmountToBePaid, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Paid', value: stats.totalPaidAmount, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Total Discount', value: stats.totalDiscount, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Balance to Pay', value: stats.balanceToPay, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Net Profit', value: stats.netProfit, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ] : [
        { label: 'Total No.of Chits', value: stats.totalNoOfChits, color: 'text-slate-700', bg: 'bg-slate-100', isCount: true },
        { label: 'Total Prize Amount', value: stats.totalPrizeAmount, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Total Amount To Paid', value: stats.totalAmountToBePaid, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Paid', value: stats.totalPaidAmount, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Total Discount', value: stats.totalDiscount, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Balance to Pay', value: stats.balanceToPay, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Net Profit', value: stats.netProfit, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ];

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 pb-24">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onClose} className="btn-secondary p-2 group hover:bg-slate-200 transition-colors">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-amber-500" />
                    Profit & Loss
                </h1>
            </div>

            <div className="card shadow-sm border-slate-200 mb-8 bg-slate-50 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Filter className="w-3 h-3" /> Select Chit
                    </label>
                    <select
                        className="input-field bg-white"
                        value={filterChitId}
                        onChange={(e) => setFilterChitId(e.target.value)}
                    >
                        <option value="">All Chits (Consolidated)</option>
                        {chits.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                {statCards.map((stat, idx) => (
                    <div key={idx} className={`card ${stat.bg} border-0 shadow-sm p-4 md:p-6 flex flex-col justify-center items-center text-center`}>
                        <p className="text-[10px] md:text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">{stat.label}</p>
                        <h2 className={`text-xl md:text-2xl font-black ${stat.color}`}>
                            {stat.isCount ? stat.value : `₹ ${stat.value.toLocaleString()}`}
                        </h2>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <h3 className="font-bold text-slate-700">Detailed Summary</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-slate-200">
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Chit Name</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Prize Amt</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount To Paid</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Paid</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Discount</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Balance</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Net Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chits.filter(c => filterChitId ? c.id === filterChitId : true).map(chit => {
                                const chitPrizes = prizes.filter(p => p.chitId === chit.id).reduce((sum, p) => sum + p.amount, 0);
                                const chitPaid = payments.filter(p => p.chitId === chit.id).reduce((sum, p) => sum + p.amountCollected, 0);
                                const totalToBePaid = chit.monthlyAmount * chit.durationMonths;

                                const discount = totalToBePaid - chitPaid;
                                const balance = totalToBePaid - chitPaid;
                                const profit = chitPaid - chitPrizes;

                                return (
                                    <tr key={chit.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-bold text-slate-800">{chit.name}</td>
                                        <td className="p-4 text-purple-600 font-bold">₹ {chitPrizes.toLocaleString()}</td>
                                        <td className="p-4 text-blue-600 font-bold">₹ {totalToBePaid.toLocaleString()}</td>
                                        <td className="p-4 text-emerald-600 font-bold">₹ {chitPaid.toLocaleString()}</td>
                                        <td className="p-4 text-orange-600 font-bold">₹ {discount.toLocaleString()}</td>
                                        <td className="p-4 text-red-600 font-bold">₹ {balance.toLocaleString()}</td>
                                        <td className="p-4 text-indigo-600 font-bold">₹ {profit.toLocaleString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProfitLossReport;
