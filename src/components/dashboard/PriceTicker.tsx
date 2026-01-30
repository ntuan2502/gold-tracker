"use client";

import { useGoldPrice } from "@/hooks/useGoldPrice";
import { RefreshCcw } from "lucide-react";
import Marquee from "react-fast-marquee";

export function PriceTicker() {
    const { prices, loading } = useGoldPrice();

    if (loading && prices.length === 0) {
        return (
            <div className="container mx-auto max-w-7xl px-4 mt-6">
                <div className="w-full h-12 rounded-xl border border-primary/20 bg-secondary/10 overflow-hidden relative">
                    <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-primary/5 to-transparent skew-x-12" />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full border-t border-primary/20 bg-secondary/30 backdrop-blur-sm h-10 flex items-center">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary shrink-0 animate-pulse z-10 px-4 border-r border-primary/20 bg-transparent h-full select-none">
                <RefreshCcw className="h-3 w-3 animate-spin duration-[3000ms]" />
                LIVE
            </div>

            <div className="flex-1 overflow-hidden min-w-0 h-full flex items-center mask-linear-fade">
                <Marquee gradient={false} speed={40} pauseOnHover autoFill>
                    {prices.map((price, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm whitespace-nowrap mx-8 select-none">
                            <span className="font-bold text-foreground text-gold-800">{price.type}</span>
                            <span className="text-muted-foreground text-xs flex items-center gap-1">
                                <span className="text-[10px] uppercase tracking-wider opacity-70">Mua</span>
                                <span className="text-foreground font-mono font-medium">{(price.buy / 10).toLocaleString()}</span>
                            </span>
                            <span className="text-muted-foreground text-xs flex items-center gap-1">
                                <span className="text-[10px] uppercase tracking-wider opacity-70">Bán</span>
                                <span className="text-foreground font-mono font-medium">{(price.sell / 10).toLocaleString()}</span>
                            </span>
                        </div>
                    ))}
                </Marquee>
            </div>
        </div>
    );
}
