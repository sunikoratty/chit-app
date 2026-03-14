import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Chit, AuctionSheet, PaymentCollection, User, Prize } from './types';

interface AppState {
    chits: Chit[];
    auctionSheets: AuctionSheet[];
    payments: PaymentCollection[];
    prizes: Prize[];
    user: User;

    addChit: (chit: Chit) => void;
    updateChit: (updatedChit: Chit) => void;
    deleteChit: (id: string) => void;
    saveAuctionSheet: (sheet: AuctionSheet) => void;
    savePayment: (payment: PaymentCollection) => void;
    savePrize: (prize: Prize) => void;
    deletePrize: (id: string) => void;
    restoreData: (data: { chits: Chit[], auctionSheets: AuctionSheet[], payments: PaymentCollection[], prizes: Prize[] }) => void;
    registerUser: (userData: Partial<User>) => void;
    login: (username: string, password: string) => boolean;
    logout: () => void;
    verifyPin: (pin: string) => boolean;
    updatePassword: (newPassword: string, pin: string) => boolean;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            chits: [],
            auctionSheets: [],
            payments: [],
            prizes: [],
            user: { username: '', isLoggedIn: false, isRegistered: false },

            addChit: (chit) => set((state) => ({ chits: [...state.chits, chit] })),

            updateChit: (updatedChit) => set((state) => ({
                chits: state.chits.map((c) => c.id === updatedChit.id ? updatedChit : c)
            })),

            deleteChit: (id) => set((state) => ({
                chits: state.chits.filter((c) => c.id !== id),
                auctionSheets: state.auctionSheets.filter((a) => a.chitId !== id),
                payments: state.payments.filter((p) => p.chitId !== id),
                prizes: state.prizes.filter((p) => p.chitId !== id),
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

            savePrize: (prize) => set((state) => {
                const exists = state.prizes.find(p => p.id === prize.id);
                if (exists) {
                    return { prizes: state.prizes.map(p => p.id === prize.id ? prize : p) };
                }
                return { prizes: [...state.prizes, prize] };
            }),

            deletePrize: (id) => set((state) => ({
                prizes: state.prizes.filter(p => p.id !== id)
            })),

            restoreData: (data) => set(() => ({
                chits: data.chits || [],
                auctionSheets: data.auctionSheets || [],
                payments: data.payments || [],
                prizes: data.prizes || []
            })),

            registerUser: (userData) => set((state) => ({
                user: { ...state.user, ...userData, isLoggedIn: true, isRegistered: true }
            })),

            login: (username, password) => {
                const state = get();
                if (state.user.isRegistered && state.user.username === username && state.user.password === password) {
                    set({ user: { ...state.user, isLoggedIn: true } });
                    return true;
                }
                if (!state.user.isRegistered && username === 'Admin' && password === 'admin') {
                    set({ user: { ...state.user, username: 'Admin', isLoggedIn: true } });
                    return true;
                }
                return false;
            },

            logout: () => set((state) => ({ user: { ...state.user, isLoggedIn: false } })),

            verifyPin: (pin: string) => {
                const state = get();
                return state.user.pin === pin;
            },

            updatePassword: (newPassword: string, pin: string) => {
                const state = get();
                if (state.user.pin === pin) {
                    set({ user: { ...state.user, password: newPassword } });
                    return true;
                }
                return false;
            },
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

        // 1. Check for older Zustand persists (v2 or v1)
        const possibleKeys = ['chits_app_storage_v2', 'chits_app_storage_v1', 'chits_app_storage'];
        possibleKeys.forEach(key => {
            const oldPersist = localStorage.getItem(key);
            if (oldPersist) {
                try {
                    const parsed = JSON.parse(oldPersist);
                    if (parsed.state) {
                        const oldState = parsed.state;

                        // Merge Chits
                        if (oldState.chits) {
                            const existing = new Set(newChits.map(c => c.id));
                            oldState.chits.forEach((c: Chit) => {
                                if (!existing.has(c.id)) { newChits.push(c); changed = true; }
                            });
                        }
                        // Merge Auctions
                        if (oldState.auctionSheets) {
                            const existing = new Set(newAuctions.map(c => c.id));
                            oldState.auctionSheets.forEach((a: AuctionSheet) => {
                                if (!existing.has(a.id)) { newAuctions.push(a); changed = true; }
                            });
                        }
                        // Merge Payments
                        if (oldState.payments) {
                            const existing = new Set(newPayments.map(p => p.id));
                            oldState.payments.forEach((p: PaymentCollection) => {
                                if (!existing.has(p.id)) { newPayments.push(p); changed = true; }
                            });
                        }
                    }
                } catch (err) {
                    console.error(`Migration from ${key} failed`, err);
                }
            }
        });

        // 2. Check for manual old keys (v2 and v1)
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
            const existing = new Set(newPayments.map(p => p.id));
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
