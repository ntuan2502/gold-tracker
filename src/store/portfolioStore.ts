import { create } from "zustand";
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    onSnapshot,
    query,
    where
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Transaction {
    id: string;
    type: "buy" | "sell" | "gift_in" | "gift_out";
    goldType: string;
    quantity: number; // Unit: Chi
    price: number; // Unit: VND per Chi
    date: string;
    totalValue: number;
    brand?: string; // e.g., "SJC", "PNJ", "DOJI"
    note?: string; // Optional note
}

interface PortfolioState {
    transactions: Transaction[];
    loading: boolean;

    // Actions
    fetchTransactions: (userId: string) => void;
    addTransaction: (transaction: Omit<Transaction, "id">, userId?: string) => Promise<void>;
    updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
    removeTransaction: (id: string) => Promise<void>;
    importTransactions: (transactions: Omit<Transaction, "id">[], userId?: string) => Promise<{ added: number; skipped: number }>;
    clearData: () => void; // New action
    getHoldings: () => {
        totalQuantity: number;
        totalInvested: number;
        breakdown: {
            buyQty: number;
            buyCost: number;
            giftQty: number;
        }
    };
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
    transactions: [],
    loading: false,

    clearData: () => set({ transactions: [] }), // Reset state

    fetchTransactions: (userId: string) => {
        set({ loading: true });
        if (!userId) {
            // Fallback or clear if no user
            set({ transactions: [], loading: false });
            return;
        }

        const q = query(
            collection(db, "transactions"),
            where("userId", "==", userId)
        );

        // Real-time listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const txData: Transaction[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                txData.push({ id: doc.id, ...data } as Transaction);
            });
            // Sort by date desc locally for display (or query sort)
            txData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            set({ transactions: txData, loading: false });
        });

        // Silence unused warning for unsubscribe if we don't return it
        void unsubscribe;
    },

    addTransaction: async (transaction, userId) => {
        // Local Optimistic Update (Optional, but Firestore listener handles sync fast)
        // For now rely on Firestore
        if (!userId) {
            // Allow mock/offline logic or error?
            // For MVP if no user, fallback to local state only (Logic from before)
            set((state) => ({
                transactions: [
                    { id: crypto.randomUUID(), ...transaction },
                    ...state.transactions,
                ],
            }));
            return;
        }

        try {
            await addDoc(collection(db, "transactions"), {
                ...transaction,
                userId,
                createdAt: new Date().toISOString()
            });
        } catch (e) {
            console.error("Add Tx Error", e);
            throw e;
        }
    },

    updateTransaction: async (id, data) => {
        try {
            const docRef = doc(db, "transactions", id);
            await updateDoc(docRef, data);
        } catch {
            // Fallback local
            set((state) => ({
                transactions: state.transactions.map(t => t.id === id ? { ...t, ...data } : t)
            }));
        }
    },

    removeTransaction: async (id) => {
        try {
            await deleteDoc(doc(db, "transactions", id));
        } catch {
            // Fallback local
            set((state) => ({
                transactions: state.transactions.filter((t) => t.id !== id),
            }));
        }
    },

    importTransactions: async (newTransactions, userId) => {
        const { transactions: currentTransactions } = get();

        // 1. Filter out duplicates
        const uniqueTransactions = newTransactions.filter(newTx => {
            const isDuplicate = currentTransactions.some(existing =>
                existing.type === newTx.type &&
                existing.goldType === newTx.goldType &&
                (existing.brand || "") === (newTx.brand || "") &&
                existing.quantity === newTx.quantity &&
                existing.price === newTx.price &&
                (existing.note || "") === (newTx.note || "") &&
                existing.date === newTx.date
            );
            return !isDuplicate;
        });

        const skippedCount = newTransactions.length - uniqueTransactions.length;

        if (uniqueTransactions.length === 0) {
            return { added: 0, skipped: skippedCount };
        }

        if (!userId) {
            // Local fallback
            set((state) => ({
                transactions: [
                    ...uniqueTransactions.map(t => ({ ...t, id: crypto.randomUUID() })),
                    ...state.transactions,
                ],
            }));
            return { added: uniqueTransactions.length, skipped: skippedCount };
        }

        try {
            const promises = uniqueTransactions.map(t => addDoc(collection(db, "transactions"), {
                ...t,
                userId,
                createdAt: new Date().toISOString()
            }));
            await Promise.all(promises);
            return { added: uniqueTransactions.length, skipped: skippedCount };
        } catch (e) {
            console.error("Import Error", e);
            throw e;
        }
    },

    getHoldings: () => {
        const { transactions } = get();

        // RE-CALCULATE ACCURATE AVERAGE COST
        let buyQty = 0;
        let buyCost = 0;
        let giftQty = 0;

        // Must process in chronological order (Oldest first)
        // Clone and Sort asc
        const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        sortedTx.forEach(t => {
            if (t.type === 'buy') {
                buyQty += t.quantity;
                buyCost += t.totalValue;
            } else if (t.type === 'gift_in') {
                giftQty += t.quantity;
            } else if (t.type === 'gift_out') {
                giftQty -= t.quantity;
            } else if (t.type === 'sell') {
                // Sell prioritizes "Bought" gold (Investment) to realize P/L
                if (buyQty >= t.quantity) {
                    // Fully covered by Bought Gold
                    const avgCost = buyCost / buyQty;
                    buyCost -= avgCost * t.quantity;
                    buyQty -= t.quantity;
                } else {
                    // Partial or Full Gift Sell
                    const boughtPart = buyQty;
                    const giftPart = t.quantity - buyQty;

                    // Clear out bought bucket
                    if (boughtPart > 0) {
                        // avgCost for the bought part
                        // buyCost should become 0 roughly? Yes.
                        buyCost = 0; // All sold
                        buyQty = 0;
                    }

                    // Deduct remainder from gift
                    giftQty -= giftPart;
                }
            }
        });

        // Prevention of precision errors
        if (buyQty < 0.001) { buyQty = 0; buyCost = 0; }
        if (giftQty < 0.001) giftQty = 0;

        return {
            totalQuantity: buyQty + giftQty,
            totalInvested: buyCost,
            breakdown: {
                buyQty,
                buyCost,
                giftQty
            }
        };
    }
}));
