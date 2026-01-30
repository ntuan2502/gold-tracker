"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

// Types for Gold Price Data
export interface GoldPrice {
    type: string;
    buy: number;
    sell: number;
    updated: string;
}

// Mock API removed
export const useGoldPrice = () => {
    const [prices, setPrices] = useState<GoldPrice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPrices = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/gold-price');
            if (!res.ok) {
                toast.error("Không thể kết nối lấy giá vàng!");
                setError("Lỗi kết nối");
                return;
            }
            const { data } = await res.json();

            if (data && data.length > 0) {
                setPrices(data);
                setError(null);
            } else {
                toast.error("Dữ liệu giá vàng rỗng!");
                setError("Dữ liệu rỗng");
            }
        } catch (err) {
            console.error("API Fetch Failed", err);
            toast.error("Không thể cập nhật giá vàng. Vui lòng kiểm tra kết nối!");
            setError("Lỗi cập nhật dữ liệu");
            setPrices([]); // Clear prices or handle as needed
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrices();
        const interval = setInterval(fetchPrices, 60000); // 1 minute refresh for server efficiency
        return () => clearInterval(interval);
    }, []);

    return { prices, loading, error, refresh: fetchPrices };
};
