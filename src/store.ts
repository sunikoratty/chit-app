import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Chit, AuctionSheet, PaymentCollection, User } from './types';

interface AppState {
    chits: Chit[];
    auctionSheets: AuctionSheet[];
    payments: PaymentCollection[];
    user: User;

    addChit: (chit: Chit) => void;
    updateChit: (updatedChit: Chit) => void;
    deleteChit: (id: string) => void;
    saveAuctionSheet: (sheet: AuctionSheet) => void;
    savePayment: (payment: PaymentCollection) => void;
    login: (username: string) => void;
    logout: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            chits: [],
            auctionSheets: [],
            payments: [],
            user: { username: '', isLoggedIn: false },

            addChit: (chit) => set((state) => ({ chits: [...state.chits, chit] })),

            updateChit: (updatedChit) => set((state) => ({
                chits: state.chits.map((c) => c.id === updatedChit.id ? updatedChit : c)
            })),

            deleteChit: (id) => set((state) => ({
                chits: state.chits.filter((c) => c.id !== id),
                auctionSheets: state.auctionSheets.filter((a) => a.chitId !== id),
                payments: state.payments.filter((p) => p.chitId !== id),
            })),

            saveAuctionSheet: (sheet) => set((state) => {
                const exists = state.auctionSheets.find(s => s.id === sheet.id);
                if (exists) {
                    return { auctionSheets: state.auctionSheets.map(s => s.id === sheet.id ? sheet : s) };
                }
                return { auctionSheets: [...state.auctionSheets, sheet] };
            }),

            savePayment: (payment) => set((state) => {
                const exists = state.payments.find(p => p.id === payment.id);
                if (exists) {
                    return { payments: state.payments.map(p => p.id === payment.id ? payment : p) };
                }
                return { payments: [...state.payments, payment] };
            }),

            login: (username) => set(() => ({ user: { username, isLoggedIn: true } })),

            logout: () => set(() => ({ user: { username: '', isLoggedIn: false } })),
        }),
        {
            name: 'chits_app_storage_v3', // unique name
        }
    )
);

// --- One-time Data Migration on Load ---
if (typeof window !== 'undefined') {
    try {
        const state = useStore.getState();
        let changed = false;
        const newChits = [...state.chits];
        const newAuctions = [...state.auctionSheets];
        const newPayments = [...state.payments];

        const parseData = (str: string | null) => str ? JSON.parse(str) : [];

        // Check both v2 and v1 keys
        const chitsOld = localStorage.getItem('chits_app_data_v2') || localStorage.getItem('chits_app_data');
        if (chitsOld) {
            const parsed = parseData(chitsOld);
            const existing = new Set(newChits.map(c => c.id));
            parsed.forEach((c: Chit) => {
                if (!existing.has(c.id)) { newChits.push(c); changed = true; }
            });
        }

        const auctionsOld = localStorage.getItem('chits_app_auctions_v2') || localStorage.getItem('chits_app_auctions');
        if (auctionsOld) {
            const parsed = parseData(auctionsOld);
            const existing = new Set(newAuctions.map(c => c.id));
            parsed.forEach((c: AuctionSheet) => {
                if (!existing.has(c.id)) { newAuctions.push(c); changed = true; }
            });
        }

        const paymentsOld = localStorage.getItem('chits_app_payments_v2') || localStorage.getItem('chits_app_payments');
        if (paymentsOld) {
            const parsed = parseData(paymentsOld);
            const existing = new Set(newPayments.map(c => c.id));
            parsed.forEach((c: PaymentCollection) => {
                if (!existing.has(c.id)) { newPayments.push(c); changed = true; }
            });
        }

        if (changed) {
            useStore.setState({ chits: newChits, auctionSheets: newAuctions, payments: newPayments });
        }
    } catch (e) {
        console.error("Data migration failed", e);
    }
}
