import { useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { writeBatch, doc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { format, parse, startOfDay, endOfDay } from 'date-fns';
import { MAX_VALID_GOLD_PRICE } from '@/lib/constants';

interface HistoryItem {
    date: string;
    type: string;
    buy: number;
    sell: number;
}

export function useGoldHistory() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<HistoryItem[]>([]);

    const fetchAndSyncHistory = useCallback(async (fromDate: string, toDate: string) => {
        setLoading(true);
        try {
            // 0. Try Fetch from Firestore First
            const fromD = startOfDay(parse(fromDate, 'dd/MM/yyyy', new Date()));
            const toD = endOfDay(parse(toDate, 'dd/MM/yyyy', new Date()));

            // Filter by ISO string comparison
            const q = query(
                collection(db, "gold_price_history"),
                where("date", ">=", fromD.toISOString()),
                where("date", "<=", toD.toISOString()),
                orderBy("date", "asc")
            );

            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const cachedData = snapshot.docs.map(doc => doc.data() as HistoryItem);

                // Integrity Check:
                // If we detect abnormally high values (e.g. > 50M per chi, implying Ta unit or error), 
                // we assume cache is corrupt and force a re-fetch.
                // Note: 50M/Chi = 500M/Ta. Safe threshold for near/medium future.
                const hasOutliers = cachedData.some(item => item.buy > MAX_VALID_GOLD_PRICE || item.sell > MAX_VALID_GOLD_PRICE);

                if (hasOutliers) {
                    console.warn(`[Cache] Detected suspicious data (>${MAX_VALID_GOLD_PRICE}). Invalidating cache and re-fetching...`);
                    // Do NOT return here. Fall through to API fetch.
                } else if (cachedData.length > 0) {
                    console.log(`[Cache] Hit! Loaded ${cachedData.length} records.`);
                    setData(cachedData);
                    setLoading(false);
                    return;
                }
            }

            console.log("[Cache] Miss. Fetching fresh data from SJC...");

            // 1. Call Formatted API
            const res = await fetch(`/api/sjc/formatted?fromDate=${fromDate}&toDate=${toDate}`);
            if (!res.ok) throw new Error("Failed to fetch history");

            const json = await res.json();
            if (!json.success || !Array.isArray(json.data)) return;

            const items: HistoryItem[] = json.data;
            setData(items);

            // 2. Sync to Firestore (Client-side)
            if (items.length > 0) {
                const batch = writeBatch(db);
                let count = 0;

                items.forEach(item => {
                    const dateObj = new Date(item.date);
                    // ID: bar_20260130_090000
                    const dateKey = format(dateObj, 'yyyyMMdd_HHmmss');
                    const docId = `${item.type}_${dateKey}`;
                    const docRef = doc(db, "gold_price_history", docId);

                    batch.set(docRef, {
                        ...item,
                        provider: 'SJC',
                        syncedAt: new Date().toISOString()
                    });
                    count++;
                });

                await batch.commit();
                console.log(`[Sync] Saved ${count} records to Firestore.`);
            }

        } catch (error) {
            console.error("History Sync Error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        fetchAndSyncHistory,
        historyData: data,
        loading
    };
}
