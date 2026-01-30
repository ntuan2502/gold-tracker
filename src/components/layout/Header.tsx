"use client";

import Link from "next/link";
import { UserNav } from "./UserNav";
import { Coins } from "lucide-react";
import { useState, useEffect } from "react";

export function Header() {
    const [currentTime, setCurrentTime] = useState("");

    useEffect(() => {
        // Hydration fix: only set time on client
        // eslint-disable-next-line
        setCurrentTime(new Date().toLocaleString('vi-VN', {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            day: '2-digit', month: '2-digit', year: 'numeric'
        }));

        const interval = setInterval(() => {
            setCurrentTime(new Date().toLocaleString('vi-VN', {
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                day: '2-digit', month: '2-digit', year: 'numeric'
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 md:px-8">
                <div className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-2">
                        <Coins className="h-6 w-6 text-primary" />
                    </div>
                    <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
                        Gold<span className="text-primary">Tracker</span>
                    </Link>
                </div>

                <div className="flex items-center gap-3 md:gap-4">
                    {/* Realtime Clock - Aligned Right */}
                    <div className="flex flex-col items-end justify-center h-full text-right">
                        <div className="font-medium font-mono tabular-nums text-xs sm:text-sm text-foreground/80 leading-none py-1">
                            {currentTime}
                        </div>
                    </div>

                    <UserNav />
                </div>
            </div>
        </header>
    );
}
