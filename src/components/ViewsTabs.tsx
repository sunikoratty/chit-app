import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { ArrowLeft, X, Edit2, Trash2, Filter, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Chit } from '../types';
import toast from 'react-hot-toast';

interface Props {
    onClose: () => void;
}

const ViewsTabs: React.FC<Props> = ({ onClose }) => {
    const { chits, auctionSheets, payments, prizes, updateChit, deleteChit, deletePrize } = useStore();

    const [activeTab, setActiveTab] = useState<'chits' | 'auctions' | 'payments' | 'prizes'>('chits');

    // Filters
    const [filterChitId, setFilterChitId] = useState<string>('');
    const [filterMonthStr, setFilterMonthStr] = useState<string>('');

    // Delete Confirmation Logic
    const [chitToDelete, setChitToDelete] = useState<Chit | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // Edit Chit Logic
    const [chitToEdit, setChitToEdit] = useState<Chit | null>(null);

    // Derived filtered data
    const filteredChits = useMemo(() => {
        return chits.filter(c => filterChitId ? c.id === filterChitId : true);
    }, [chits, filterChitId]);

    const filteredAuctions = useMemo(() => {
        return auctionSheets.filter(a => {
            const matchChit = filterChitId ? a.chitId === filterChitId : true;
            const matchMonth = filterMonthStr ? a.month.toString() === filterMonthStr : true;
            return matchChit && matchMonth;
        });
    }, [auctionSheets, filterChitId, filterMonthStr]);

    const filteredPayments = useMemo(() => {
        return payments.filter(p => {
            const matchChit = filterChitId ? p.chitId === filterChitId : true;
            const matchMonth = filterMonthStr ? p.month.toString() === filterMonthStr : true;
            return matchChit && matchMonth;
        });
    }, [payments, filterChitId, filterMonthStr]);

    const filteredPrizes = useMemo(() => {
        return prizes.filter(p => filterChitId ? p.chitId === filterChitId : true);
    }, [prizes, filterChitId]);

    const getChitName = (id: string) => chits.find(c => c.id === id)?.name || 'Unknown Chit';

    const handleDeleteConfirm = () => {
        if (deleteConfirmText === 'DELETE' && chitToDelete) {
            deleteChit(chitToDelete.id);
            toast.success(`${chitToDelete.name} and all its records have been deleted.`);
            setChitToDelete(null);
            setDeleteConfirmText('');
        } else {
            toast.error("Please type DELETE exactly to confirm.");
        }
    };

    const handleEditSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (chitToEdit) {
            const updatedChit = {
                ...chitToEdit,
                totalChitValue: chitToEdit.totalMembers * chitToEdit.monthlyAmount,
                commissionAmount: ((chitToEdit.totalMembers * chitToEdit.monthlyAmount) * chitToEdit.commissionPercent) / 100
            };
            updateChit(updatedChit);
            toast.success("Chit updated successfully.");
            setChitToEdit(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 pb-24">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="btn-secondary p-2 group hover:bg-slate-200 transition-colors">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        Reports & Views
                    </h1>
                </div>
                <button onClick={onClose} className="btn-secondary p-2 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors" title="Close">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Filters */}
            <div className="card shadow-sm border-slate-200 mb-6 bg-slate-50 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Filter className="w-3 h-3" /> Filter by Chit
                    </label>
                    <select
                        className="input-field bg-white"
                        value={filterChitId}
                        onChange={(e) => setFilterChitId(e.target.value)}
                    >
                        <option value="">All Chits</option>
                        {chits.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                {activeTab !== 'chits' && (
                    <div className="flex-1 w-full md:w-48">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <Filter className="w-3 h-3" /> Filter by Month
                        </label>
                        <input
                            type="number"
                            className="input-field bg-white"
                            placeholder="e.g., 2"
                            value={filterMonthStr}
                            onChange={(e) => setFilterMonthStr(e.target.value)}
                        />
                    </div>
                )}
                <div className="w-full md:w-auto">
                    <button
                        onClick={() => { setFilterChitId(''); setFilterMonthStr(''); }}
                        className="btn-secondary py-3 px-6 w-full whitespace-nowrap"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200 pb-px overflow-x-auto hide-scrollbar">
                {(['chits', 'auctions', 'payments', 'prizes'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 font-bold text-sm uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap ${activeTab === tab
                            ? 'border-primary-600 text-primary-700 bg-primary-50/50 rounded-t-xl'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-t-xl'
                            }`}
                    >
                        {tab === 'chits' ? 'Registered Chits' : tab === 'auctions' ? 'Auction Reports' : tab === 'payments' ? 'Payment Collection' : 'Prize Details'}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
                {activeTab === 'chits' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredChits.length === 0 ? (
                            <p className="text-slate-500 col-span-full text-center py-10">No chits found.</p>
                        ) : (
                            filteredChits.map(chit => (
                                <div key={chit.id} className="card border-slate-200 shadow-sm flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-bold text-slate-900">{chit.name}</h3>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${chit.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                            {chit.status}
                                        </span>
                                    </div>
                                    <div className="space-y-2 mb-6 flex-1 text-sm text-slate-600">
                                        <p className="flex justify-between"><span className="text-slate-400">Total Members:</span> <b>{chit.totalMembers}</b></p>
                                        <p className="flex justify-between"><span className="text-slate-400">Monthly Amt:</span> <b>₹{chit.monthlyAmount}</b></p>
                                        <p className="flex justify-between"><span className="text-slate-400">Duration:</span> <b>{chit.durationMonths} Months</b></p>
                                        <p className="flex justify-between"><span className="text-slate-400">Total Value:</span> <b className="text-primary-600">₹{chit.totalChitValue.toLocaleString()}</b></p>
                                    </div>
                                    <div className="flex gap-2 pt-4 border-t border-slate-100">
                                        <button onClick={() => setChitToEdit(chit)} className="flex-1 btn-secondary py-2 text-sm flex justify-center items-center gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                                            <Edit2 className="w-4 h-4" /> Edit
                                        </button>
                                        <button onClick={() => setChitToDelete(chit)} className="flex-1 btn-secondary py-2 text-sm flex justify-center items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                                            <Trash2 className="w-4 h-4" /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'auctions' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Chit Name</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Month</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Dividend</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ded. per Member</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Net Monthly Pay</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAuctions.length === 0 ? (
                                        <tr><td colSpan={5} className="p-8 text-center text-slate-500">No auction reports found matching the criteria.</td></tr>
                                    ) : (
                                        filteredAuctions.map(a => (
                                            <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                <td className="p-4 font-bold text-slate-800">{getChitName(a.chitId)}</td>
                                                <td className="p-4 font-medium text-slate-600">Month {a.month}</td>
                                                <td className="p-4 text-slate-600">₹ {a.totalDividend.toLocaleString()}</td>
                                                <td className="p-4 text-blue-600 font-bold">₹ {Number.isInteger(a.deductionPerMember) ? a.deductionPerMember.toLocaleString() : a.deductionPerMember.toFixed(2)}</td>
                                                <td className="p-4 text-emerald-600 font-black">₹ {a.netMonthlyPay.toLocaleString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'payments' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Chit Name</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Month</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Collected By</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amt Due </th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amt Collected</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayments.length === 0 ? (
                                        <tr><td colSpan={7} className="p-8 text-center text-slate-500">No payment records found matching the criteria.</td></tr>
                                    ) : (
                                        filteredPayments.map(p => {
                                            const isSettled = p.status === 'paid';
                                            const rowClass = isSettled
                                                ? 'bg-emerald-50/30 hover:bg-emerald-50/60'
                                                : 'bg-red-50/30 hover:bg-red-50/60';

                                            return (
                                                <tr key={p.id} className={`border-b border-slate-100 transition-colors ${rowClass}`}>
                                                    <td className="p-4 text-sm font-medium text-slate-600">{p.dateOfPayment}</td>
                                                    <td className="p-4 font-bold text-slate-800">{getChitName(p.chitId)}</td>
                                                    <td className="p-4 font-medium text-slate-600">Month {p.month}</td>
                                                    <td className="p-4 text-slate-600 text-sm">{p.receivedBy}</td>
                                                    <td className="p-4 font-bold text-slate-600">₹ {p.amountDue.toLocaleString()}</td>
                                                    <td className="p-4 font-bold text-slate-800">₹ {p.amountCollected.toLocaleString()}</td>
                                                    <td className="p-4">
                                                        {isSettled ? (
                                                            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full w-fit">
                                                                <CheckCircle2 className="w-3 h-3" /> Settled
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-red-700 bg-red-100 px-2 py-1 rounded-full w-fit">
                                                                <AlertCircle className="w-3 h-3" /> Pending
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'prizes' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Chit Name</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPrizes.length === 0 ? (
                                        <tr><td colSpan={5} className="p-8 text-center text-slate-500">No prize records found matching the criteria.</td></tr>
                                    ) : (
                                        filteredPrizes.map(p => (
                                            <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                <td className="p-4 font-bold text-slate-800">{getChitName(p.chitId)}</td>
                                                <td className="p-4 font-black text-primary-600">₹ {p.amount.toLocaleString()}</td>
                                                <td className="p-4 text-slate-600">{p.date}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.type === 'lucky_draw' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>
                                                        {p.type.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('Are you sure you want to delete this prize record?')) {
                                                                deletePrize(p.id);
                                                                toast.success('Prize record deleted');
                                                            }
                                                        }}
                                                        className="text-red-500 hover:text-red-700 p-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}

            {/* Delete Confirmation Modal */}
            {chitToDelete && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="card max-w-md w-full shadow-2xl">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Chit</h3>
                        <p className="text-slate-600 font-medium mb-4">
                            Are you sure you want to delete <b className="text-slate-900">{chitToDelete.name}</b>?<br /><br />
                            <span className="text-red-500 font-bold bg-red-50 px-2 py-1 rounded">Deleting this chit will remove all associated auction and payment records.</span>
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Type DELETE to confirm</label>
                            <input
                                type="text"
                                className="input-field border-red-200 focus:border-red-500 focus:ring-red-500/20"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="DELETE"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setChitToDelete(null)} className="flex-1 btn-secondary">Cancel</button>
                            <button onClick={handleDeleteConfirm} className="flex-1 btn-primary bg-red-600 hover:bg-red-700 shadow-red-200">Delete Permanently</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Chit Modal (Basic) */}
            {chitToEdit && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="card max-w-2xl w-full shadow-2xl my-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Edit Chit</h3>
                            <button onClick={() => setChitToEdit(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleEditSave} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Chit Name</label>
                                    <input type="text" className="input-field" value={chitToEdit.name} onChange={e => setChitToEdit({ ...chitToEdit, name: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Start Date</label>
                                    <input type="date" className="input-field" value={chitToEdit.startDate} onChange={e => setChitToEdit({ ...chitToEdit, startDate: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Total Members</label>
                                    <input type="number" className="input-field" value={chitToEdit.totalMembers} onChange={e => setChitToEdit({ ...chitToEdit, totalMembers: Number(e.target.value) })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Monthly Amount</label>
                                    <input type="number" className="input-field" value={chitToEdit.monthlyAmount} onChange={e => setChitToEdit({ ...chitToEdit, monthlyAmount: Number(e.target.value) })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Commission Percent (%)</label>
                                    <input type="number" className="input-field" value={chitToEdit.commissionPercent} onChange={e => setChitToEdit({ ...chitToEdit, commissionPercent: Number(e.target.value) })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Duration (Months)</label>
                                    <input type="number" className="input-field" value={chitToEdit.durationMonths} onChange={e => setChitToEdit({ ...chitToEdit, durationMonths: Number(e.target.value) })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Divisions</label>
                                    <input type="number" className="input-field" value={chitToEdit.divisions} onChange={e => setChitToEdit({ ...chitToEdit, divisions: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Lucky Draws / Month</label>
                                    <input type="number" className="input-field" value={chitToEdit.luckyDrawsPerMonth} onChange={e => setChitToEdit({ ...chitToEdit, luckyDrawsPerMonth: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Auctions / Month</label>
                                    <input type="number" className="input-field" value={chitToEdit.auctionsPerMonth} onChange={e => setChitToEdit({ ...chitToEdit, auctionsPerMonth: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                                    <select className="input-field bg-white" value={chitToEdit.status} onChange={e => setChitToEdit({ ...chitToEdit, status: e.target.value as any })}>
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center mb-4 mt-2">
                                <span className="font-bold text-slate-700">Total Chit Value</span>
                                <span className="text-xl font-black text-primary-700">₹ {(chitToEdit.totalMembers * chitToEdit.monthlyAmount).toLocaleString()}</span>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button type="button" onClick={() => setChitToEdit(null)} className="btn-secondary px-6">Cancel</button>
                                <button type="submit" className="btn-primary px-6">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ViewsTabs;
