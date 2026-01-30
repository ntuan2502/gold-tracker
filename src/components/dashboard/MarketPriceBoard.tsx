"use client";

import { GoldPrice } from "@/hooks/useGoldPrice";
import { BarChart3, Coins, TrendingUp } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { SUPPORTED_BRANDS } from "@/lib/constants";

interface MarketPriceBoardProps {
    prices: GoldPrice[];
    loading: boolean;
}

export function MarketPriceBoard({ prices, loading }: MarketPriceBoardProps) {
    const [selectedBrand, setSelectedBrand] = useState("SJC");

    // Extract available brands from data ensuring SJC is always first if available
    const availableBrands = useMemo(() => {
        if (!prices || prices.length === 0) return ["SJC"];

        const brands = new Set<string>();
        prices.forEach(p => {
            // Simple heuristic: Check which supported brand is in the type string
            const brand = SUPPORTED_BRANDS.find(b => p.type.includes(b));
            if (brand) brands.add(brand);
        });

        // Sort based on priority list
        return Array.from(brands).sort((a, b) => {
            return SUPPORTED_BRANDS.indexOf(a) - SUPPORTED_BRANDS.indexOf(b);
        });
    }, [prices]);

    // Get prices for selected brand
    const brandPrices = useMemo(() => {
        if (!prices) return { mieng: null, nhan: null };
        const mieng = prices.find(p => p.type.includes(selectedBrand) && p.type.includes("Miếng"));
        const nhan = prices.find(p => p.type.includes(selectedBrand) && p.type.includes("Nhẫn"));
        return { mieng, nhan };
    }, [prices, selectedBrand]);

    // Calculate Best Prices (Insights)
    const insights = useMemo(() => {
        if (!prices || prices.length === 0) return null;

        const findBest = (keyword: string) => {
            const relevant = prices.filter(p => p.type.includes(keyword) && p.buy > 0 && p.sell > 0);
            if (relevant.length === 0) return null;

            // Best place to SELL (User Sells -> Shop Buys -> Maximize Buy Price)
            const bestSell = relevant.reduce((prev, curr) => (curr.buy > prev.buy ? curr : prev));

            // Best place to BUY (User Buys -> Shop Sells -> Minimize Sell Price)
            const bestBuy = relevant.reduce((prev, curr) => (curr.sell < prev.sell ? curr : prev));

            return { bestSell, bestBuy };
        };

        return {
            mieng: findBest("Miếng"),
            nhan: findBest("Nhẫn")
        };
    }, [prices]);

    const extractBrand = (type: string) => {
        // Remove (Miếng), (Nhẫn) etc to get clearer brand name
        return type.replace(/\s*\([^)]*\)/g, "").trim();
    };

    const lastUpdated = useMemo(() => {
        return prices.length > 0 ? prices[0].updated : null;
    }, [prices]);

    if (loading) return <div className="h-40 animate-pulse rounded-xl bg-muted"></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Thị Trường Hôm Nay
                    </h3>
                    {lastUpdated && (
                        <p className="text-xs text-muted-foreground mt-1 ml-7">
                            Cập nhật lúc: {lastUpdated}
                        </p>
                    )}
                </div>

                {/* Brand Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                    {availableBrands.map(brand => (
                        <button
                            key={brand}
                            onClick={() => setSelectedBrand(brand)}
                            className={cn(
                                "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                                selectedBrand === brand
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                            )}
                        >
                            {brand}
                        </button>
                    ))}
                </div>
            </div>

            {/* MAIN PRICE GRID (Moved Up) */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {/* Vàng Miếng */}
                {brandPrices.mieng ? (
                    <>
                        <div className="rounded-xl border bg-card p-4 shadow-sm transition-all hover:border-amber-200 hover:bg-amber-50/30">
                            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                                <BarChart3 className="h-4 w-4 text-red-600" />
                                <span className="text-xs font-medium uppercase">Miếng - Mua vào</span>
                            </div>
                            <p className="text-xl font-bold tracking-tight text-red-600 dark:text-red-400">
                                {(brandPrices.mieng.buy / 10).toLocaleString('vi-VN')}
                                <span className="text-sm font-normal text-muted-foreground ml-1">₫</span>
                            </p>
                        </div>
                        <div className="rounded-xl border bg-card p-4 shadow-sm transition-all hover:border-amber-200 hover:bg-amber-50/30">
                            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                                <BarChart3 className="h-4 w-4 text-green-600" />
                                <span className="text-xs font-medium uppercase">Miếng - Bán ra</span>
                            </div>
                            <p className="text-xl font-bold tracking-tight text-green-600 dark:text-green-400">
                                {(brandPrices.mieng.sell / 10).toLocaleString('vi-VN')}
                                <span className="text-sm font-normal text-muted-foreground ml-1">₫</span>
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="col-span-2 flex h-24 items-center justify-center rounded-xl border border-dashed bg-muted/50 text-sm text-muted-foreground">
                        Không có dữ liệu Vàng Miếng
                    </div>
                )}

                {/* Vàng Nhẫn */}
                {brandPrices.nhan ? (
                    <>
                        <div className="rounded-xl border bg-card p-4 shadow-sm transition-all hover:border-rose-200 hover:bg-rose-50/30">
                            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                                <Coins className="h-4 w-4 text-red-600" />
                                <span className="text-xs font-medium uppercase">Nhẫn - Mua vào</span>
                            </div>
                            <p className="text-xl font-bold tracking-tight text-red-600 dark:text-red-400">
                                {(brandPrices.nhan.buy / 10).toLocaleString('vi-VN')}
                                <span className="text-sm font-normal text-muted-foreground ml-1">₫</span>
                            </p>
                        </div>
                        <div className="rounded-xl border bg-card p-4 shadow-sm transition-all hover:border-rose-200 hover:bg-rose-50/30">
                            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                                <Coins className="h-4 w-4 text-green-600" />
                                <span className="text-xs font-medium uppercase">Nhẫn - Bán ra</span>
                            </div>
                            <p className="text-xl font-bold tracking-tight text-green-600 dark:text-green-400">
                                {(brandPrices.nhan.sell / 10).toLocaleString('vi-VN')}
                                <span className="text-sm font-normal text-muted-foreground ml-1">₫</span>
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="col-span-2 flex h-24 items-center justify-center rounded-xl border border-dashed bg-muted/50 text-sm text-muted-foreground">
                        Không có dữ liệu Vàng Nhẫn
                    </div>
                )}
            </div>

            {/* Smart Insights Section (Moved Down & Modernized) */}
            {insights && (
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Insights Vàng Miếng */}
                    {insights.mieng && (
                        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-amber-50/50 to-orange-50/50 p-4 transition-all hover:shadow-sm">
                            <div className="mb-3 flex items-center justify-between">
                                <h4 className="flex items-center gap-2 font-semibold text-amber-700">
                                    <BarChart3 className="h-4 w-4" /> Giá Tốt Nhất (Miếng)
                                </h4>
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 uppercase">Gợi Ý</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-[10px] uppercase text-muted-foreground font-semibold">Mua Rẻ Nhất</span>
                                    <div className="mt-1 font-medium text-red-700">
                                        {extractBrand(insights.mieng.bestBuy.type)}
                                        <div className="text-xl font-bold">{(insights.mieng.bestBuy.sell / 10).toLocaleString('vi-VN')}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-[10px] uppercase text-muted-foreground font-semibold">Bán Cao Nhất</span>
                                    <div className="mt-1 font-medium text-green-700">
                                        {extractBrand(insights.mieng.bestSell.type)}
                                        <div className="text-xl font-bold">{(insights.mieng.bestSell.buy / 10).toLocaleString('vi-VN')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Insights Vàng Nhẫn */}
                    {insights.nhan && (
                        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-rose-50/50 to-pink-50/50 p-4 transition-all hover:shadow-sm">
                            <div className="mb-3 flex items-center justify-between">
                                <h4 className="flex items-center gap-2 font-semibold text-rose-700">
                                    <Coins className="h-4 w-4" /> Giá Tốt Nhất (Nhẫn)
                                </h4>
                                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 uppercase">Gợi Ý</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-[10px] uppercase text-muted-foreground font-semibold">Mua Rẻ Nhất</span>
                                    <div className="mt-1 font-medium text-red-700">
                                        {extractBrand(insights.nhan.bestBuy.type)}
                                        <div className="text-xl font-bold">{(insights.nhan.bestBuy.sell / 10).toLocaleString('vi-VN')}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-[10px] uppercase text-muted-foreground font-semibold">Bán Cao Nhất</span>
                                    <div className="mt-1 font-medium text-green-700">
                                        {extractBrand(insights.nhan.bestSell.type)}
                                        <div className="text-xl font-bold">{(insights.nhan.bestSell.buy / 10).toLocaleString('vi-VN')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
